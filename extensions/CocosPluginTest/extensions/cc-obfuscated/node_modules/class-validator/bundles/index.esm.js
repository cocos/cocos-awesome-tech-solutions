import validator from 'validator';
import { PhoneNumberUtil } from 'google-libphonenumber';

/**
 * This metadata contains validation rules.
 */
class ValidationMetadata {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(args) {
        /**
         * Validation groups used for this validation.
         */
        this.groups = [];
        /**
         * Indicates if validation must be performed always, no matter of validation groups used.
         */
        this.always = false;
        /**
         * Specifies if validated value is an array and each of its item must be validated.
         */
        this.each = false;
        /*
         * A transient set of data passed through to the validation result for response mapping
         */
        this.context = undefined;
        this.type = args.type;
        this.target = args.target;
        this.propertyName = args.propertyName;
        this.constraints = args.constraints;
        this.constraintCls = args.constraintCls;
        this.validationTypeOptions = args.validationTypeOptions;
        if (args.validationOptions) {
            this.message = args.validationOptions.message;
            this.groups = args.validationOptions.groups;
            this.always = args.validationOptions.always;
            this.each = args.validationOptions.each;
            this.context = args.validationOptions.context;
        }
    }
}

/**
 * Used to transform validation schemas to validation metadatas.
 */
class ValidationSchemaToMetadataTransformer {
    transform(schema) {
        const metadatas = [];
        Object.keys(schema.properties).forEach(property => {
            schema.properties[property].forEach(validation => {
                const validationOptions = {
                    message: validation.message,
                    groups: validation.groups,
                    always: validation.always,
                    each: validation.each
                };
                const args = {
                    type: validation.type,
                    target: schema.name,
                    propertyName: property,
                    constraints: validation.constraints,
                    validationTypeOptions: validation.options,
                    validationOptions: validationOptions
                };
                metadatas.push(new ValidationMetadata(args));
            });
        });
        return metadatas;
    }
}

/**
 * Gets metadata storage.
 * Metadata storage follows the best practices and stores metadata in a global variable.
 */
function getMetadataStorage() {
    if (typeof window !== "undefined") {
        window.global = window;
    }
    if (!global.classValidatorMetadataStorage)
        global.classValidatorMetadataStorage = new MetadataStorage();
    return global.classValidatorMetadataStorage;
}
/**
 * Storage all metadatas.
 */
class MetadataStorage {
    constructor() {
        // -------------------------------------------------------------------------
        // Private properties
        // -------------------------------------------------------------------------
        this.validationMetadatas = [];
        this.constraintMetadatas = [];
    }
    get hasValidationMetaData() {
        return !!this.validationMetadatas.length;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Adds a new validation metadata.
     */
    addValidationSchema(schema) {
        const validationMetadatas = new ValidationSchemaToMetadataTransformer().transform(schema);
        validationMetadatas.forEach(validationMetadata => this.addValidationMetadata(validationMetadata));
    }
    /**
     * Adds a new validation metadata.
     */
    addValidationMetadata(metadata) {
        this.validationMetadatas.push(metadata);
    }
    /**
     * Adds a new constraint metadata.
     */
    addConstraintMetadata(metadata) {
        this.constraintMetadatas.push(metadata);
    }
    /**
     * Groups metadata by their property names.
     */
    groupByPropertyName(metadata) {
        const grouped = {};
        metadata.forEach(metadata => {
            if (!grouped[metadata.propertyName])
                grouped[metadata.propertyName] = [];
            grouped[metadata.propertyName].push(metadata);
        });
        return grouped;
    }
    /**
     * Gets all validation metadatas for the given object with the given groups.
     */
    getTargetValidationMetadatas(targetConstructor, targetSchema, groups) {
        // get directly related to a target metadatas
        const originalMetadatas = this.validationMetadatas.filter(metadata => {
            if (metadata.target !== targetConstructor && metadata.target !== targetSchema)
                return false;
            if (metadata.always)
                return true;
            if (groups && groups.length > 0)
                return metadata.groups && !!metadata.groups.find(group => groups.indexOf(group) !== -1);
            return true;
        });
        // get metadatas for inherited classes
        const inheritedMetadatas = this.validationMetadatas.filter(metadata => {
            // if target is a string it's means we validate agains a schema, and there is no inheritance support for schemas
            if (typeof metadata.target === "string")
                return false;
            if (metadata.target === targetConstructor)
                return false;
            if (metadata.target instanceof Function &&
                !(targetConstructor.prototype instanceof metadata.target))
                return false;
            if (metadata.always)
                return true;
            if (groups && groups.length > 0)
                return metadata.groups && !!metadata.groups.find(group => groups.indexOf(group) !== -1);
            return true;
        });
        // filter out duplicate metadatas, prefer original metadatas instead of inherited metadatas
        const uniqueInheritedMetadatas = inheritedMetadatas.filter(inheritedMetadata => {
            return !originalMetadatas.find(originalMetadata => {
                return originalMetadata.propertyName === inheritedMetadata.propertyName &&
                    originalMetadata.type === inheritedMetadata.type;
            });
        });
        return originalMetadatas.concat(uniqueInheritedMetadatas);
    }
    /**
     * Gets all validator constraints for the given object.
     */
    getTargetValidatorConstraints(target) {
        return this.constraintMetadatas.filter(metadata => metadata.target === target);
    }
}

/**
 * Validation error description.
 */
class ValidationError {
    /**
     *
     * @param shouldDecorate decorate the message with ANSI formatter escape codes for better readability
     * @param hasParent true when the error is a child of an another one
     * @param parentPath path as string to the parent of this property
     */
    toString(shouldDecorate = false, hasParent = false, parentPath = ``) {
        const boldStart = shouldDecorate ? `\x1b[1m` : ``;
        const boldEnd = shouldDecorate ? `\x1b[22m` : ``;
        const propConstraintFailed = (propertyName) => ` - property ${boldStart}${parentPath}${propertyName}${boldEnd} has failed the following constraints: ${boldStart}${Object.keys(this.constraints).join(`, `)}${boldEnd} \n`;
        if (!hasParent) {
            return `An instance of ${boldStart}${this.target ? this.target.constructor.name : "an object"}${boldEnd} has failed the validation:\n` +
                (this.constraints ? propConstraintFailed(this.property) : ``) +
                this.children
                    .map(childError => childError.toString(shouldDecorate, true, this.property))
                    .join(``);
        }
        else {
            // we format numbers as array indexes for better readability.
            const formattedProperty = Number.isInteger(+this.property) ? `[${this.property}]` : `${parentPath ? `.` : ``}${this.property}`;
            if (this.constraints) {
                return propConstraintFailed(formattedProperty);
            }
            else {
                return this.children
                    .map(childError => childError.toString(shouldDecorate, true, `${parentPath}${formattedProperty}`))
                    .join(``);
            }
        }
    }
}

/**
 * Validation types.
 */
class ValidationTypes {
    /**
     * Checks if validation type is valid.
     */
    static isValid(type) {
        return type !== "isValid" &&
            type !== "getMessage" &&
            Object.keys(this).map(key => this[key]).indexOf(type) !== -1;
    }
}
/* system */
ValidationTypes.CUSTOM_VALIDATION = "customValidation"; // done
ValidationTypes.NESTED_VALIDATION = "nestedValidation"; // done
ValidationTypes.PROMISE_VALIDATION = "promiseValidation"; // done
ValidationTypes.CONDITIONAL_VALIDATION = "conditionalValidation"; // done
ValidationTypes.WHITELIST = "whitelistValidation"; // done
ValidationTypes.IS_DEFINED = "isDefined"; // done

class ValidationUtils {
    static replaceMessageSpecialTokens(message, validationArguments) {
        let messageString;
        if (message instanceof Function) {
            messageString = message(validationArguments);
        }
        else if (typeof message === "string") {
            messageString = message;
        }
        if (messageString && validationArguments.constraints instanceof Array) {
            validationArguments.constraints.forEach((constraint, index) => {
                messageString = messageString.replace(new RegExp(`\\$constraint${index + 1}`, "g"), constraint);
            });
        }
        if (messageString && validationArguments.value !== undefined && validationArguments.value !== null && typeof validationArguments.value === "string")
            messageString = messageString.replace(/\$value/g, validationArguments.value);
        if (messageString)
            messageString = messageString.replace(/\$property/g, validationArguments.property);
        if (messageString)
            messageString = messageString.replace(/\$target/g, validationArguments.targetName);
        return messageString;
    }
}

// https://github.com/TylorS/typed-is-promise/blob/abf1514e1b6961adfc75765476b0debb96b2c3ae/src/index.ts
function isPromise(p) {
    return p !== null && typeof p === "object" && typeof p.then === "function";
}
/**
 * Convert Map, Set to Array
 */
function convertToArray(val) {
    if (val instanceof Map) {
        return Array.from(val.values());
    }
    return Array.isArray(val) ? val : Array.from(val);
}

/**
 * Executes validation over given object.
 */
class ValidationExecutor {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(validator, validatorOptions) {
        this.validator = validator;
        this.validatorOptions = validatorOptions;
        // -------------------------------------------------------------------------
        // Properties
        // -------------------------------------------------------------------------
        this.awaitingPromises = [];
        this.ignoreAsyncValidations = false;
        // -------------------------------------------------------------------------
        // Private Properties
        // -------------------------------------------------------------------------
        this.metadataStorage = getMetadataStorage();
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    execute(object, targetSchema, validationErrors) {
        /**
         * If there is no metadata registered it means possibly the dependencies are not flatterned and
         * more than one instance is used.
         *
         * TODO: This needs proper handling, forcing to use the same container or some other proper solution.
         */
        if (!this.metadataStorage.hasValidationMetaData) {
            console.warn(`No metadata found. There is more than once class-validator version installed probably. You need to flatten your dependencies.`);
        }
        const groups = this.validatorOptions ? this.validatorOptions.groups : undefined;
        const targetMetadatas = this.metadataStorage.getTargetValidationMetadatas(object.constructor, targetSchema, groups);
        const groupedMetadatas = this.metadataStorage.groupByPropertyName(targetMetadatas);
        if (this.validatorOptions && this.validatorOptions.forbidUnknownValues && !targetMetadatas.length) {
            const validationError = new ValidationError();
            if (!this.validatorOptions ||
                !this.validatorOptions.validationError ||
                this.validatorOptions.validationError.target === undefined ||
                this.validatorOptions.validationError.target === true)
                validationError.target = object;
            validationError.value = undefined;
            validationError.property = undefined;
            validationError.children = [];
            validationError.constraints = { unknownValue: "an unknown value was passed to the validate function" };
            validationErrors.push(validationError);
            return;
        }
        if (this.validatorOptions && this.validatorOptions.whitelist)
            this.whitelist(object, groupedMetadatas, validationErrors);
        // General validation
        Object.keys(groupedMetadatas).forEach(propertyName => {
            const value = object[propertyName];
            const definedMetadatas = groupedMetadatas[propertyName].filter(metadata => metadata.type === ValidationTypes.IS_DEFINED);
            const metadatas = groupedMetadatas[propertyName].filter(metadata => metadata.type !== ValidationTypes.IS_DEFINED && metadata.type !== ValidationTypes.WHITELIST);
            if (value instanceof Promise && metadatas.find(metadata => metadata.type === ValidationTypes.PROMISE_VALIDATION)) {
                this.awaitingPromises.push(value.then((resolvedValue) => {
                    this.performValidations(object, resolvedValue, propertyName, definedMetadatas, metadatas, validationErrors);
                }));
            }
            else {
                this.performValidations(object, value, propertyName, definedMetadatas, metadatas, validationErrors);
            }
        });
    }
    whitelist(object, groupedMetadatas, validationErrors) {
        let notAllowedProperties = [];
        Object.keys(object).forEach(propertyName => {
            // does this property have no metadata?
            if (!groupedMetadatas[propertyName] || groupedMetadatas[propertyName].length === 0)
                notAllowedProperties.push(propertyName);
        });
        if (notAllowedProperties.length > 0) {
            if (this.validatorOptions && this.validatorOptions.forbidNonWhitelisted) {
                // throw errors
                notAllowedProperties.forEach(property => {
                    const validationError = this.generateValidationError(object, object[property], property);
                    validationError.constraints = { [ValidationTypes.WHITELIST]: `property ${property} should not exist` };
                    validationError.children = undefined;
                    validationErrors.push(validationError);
                });
            }
            else {
                // strip non allowed properties
                notAllowedProperties.forEach(property => delete object[property]);
            }
        }
    }
    stripEmptyErrors(errors) {
        return errors.filter(error => {
            if (error.children) {
                error.children = this.stripEmptyErrors(error.children);
            }
            if (Object.keys(error.constraints).length === 0) {
                if (error.children.length === 0) {
                    return false;
                }
                else {
                    delete error.constraints;
                }
            }
            return true;
        });
    }
    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------
    performValidations(object, value, propertyName, definedMetadatas, metadatas, validationErrors) {
        const customValidationMetadatas = metadatas.filter(metadata => metadata.type === ValidationTypes.CUSTOM_VALIDATION);
        const nestedValidationMetadatas = metadatas.filter(metadata => metadata.type === ValidationTypes.NESTED_VALIDATION);
        const conditionalValidationMetadatas = metadatas.filter(metadata => metadata.type === ValidationTypes.CONDITIONAL_VALIDATION);
        const validationError = this.generateValidationError(object, value, propertyName);
        validationErrors.push(validationError);
        const canValidate = this.conditionalValidations(object, value, conditionalValidationMetadatas);
        if (!canValidate) {
            return;
        }
        // handle IS_DEFINED validation type the special way - it should work no matter skipUndefinedProperties/skipMissingProperties is set or not
        this.customValidations(object, value, definedMetadatas, validationError);
        this.mapContexts(object, value, definedMetadatas, validationError);
        if (value === undefined && this.validatorOptions && this.validatorOptions.skipUndefinedProperties === true) {
            return;
        }
        if (value === null && this.validatorOptions && this.validatorOptions.skipNullProperties === true) {
            return;
        }
        if ((value === null || value === undefined) && this.validatorOptions && this.validatorOptions.skipMissingProperties === true) {
            return;
        }
        this.customValidations(object, value, customValidationMetadatas, validationError);
        this.nestedValidations(value, nestedValidationMetadatas, validationError.children);
        this.mapContexts(object, value, metadatas, validationError);
        this.mapContexts(object, value, customValidationMetadatas, validationError);
    }
    generateValidationError(object, value, propertyName) {
        const validationError = new ValidationError();
        if (!this.validatorOptions ||
            !this.validatorOptions.validationError ||
            this.validatorOptions.validationError.target === undefined ||
            this.validatorOptions.validationError.target === true)
            validationError.target = object;
        if (!this.validatorOptions ||
            !this.validatorOptions.validationError ||
            this.validatorOptions.validationError.value === undefined ||
            this.validatorOptions.validationError.value === true)
            validationError.value = value;
        validationError.property = propertyName;
        validationError.children = [];
        validationError.constraints = {};
        return validationError;
    }
    conditionalValidations(object, value, metadatas) {
        return metadatas
            .map(metadata => metadata.constraints[0](object, value))
            .reduce((resultA, resultB) => resultA && resultB, true);
    }
    customValidations(object, value, metadatas, error) {
        metadatas.forEach(metadata => {
            this.metadataStorage
                .getTargetValidatorConstraints(metadata.constraintCls)
                .forEach(customConstraintMetadata => {
                if (customConstraintMetadata.async && this.ignoreAsyncValidations)
                    return;
                const validationArguments = {
                    targetName: object.constructor ? object.constructor.name : undefined,
                    property: metadata.propertyName,
                    object: object,
                    value: value,
                    constraints: metadata.constraints
                };
                if (!metadata.each || !(value instanceof Array || value instanceof Set || value instanceof Map)) {
                    const validatedValue = customConstraintMetadata.instance.validate(value, validationArguments);
                    if (isPromise(validatedValue)) {
                        const promise = validatedValue.then(isValid => {
                            if (!isValid) {
                                const [type, message] = this.createValidationError(object, value, metadata, customConstraintMetadata);
                                error.constraints[type] = message;
                                if (metadata.context) {
                                    if (!error.contexts) {
                                        error.contexts = {};
                                    }
                                    error.contexts[type] = Object.assign((error.contexts[type] || {}), metadata.context);
                                }
                            }
                        });
                        this.awaitingPromises.push(promise);
                    }
                    else {
                        if (!validatedValue) {
                            const [type, message] = this.createValidationError(object, value, metadata, customConstraintMetadata);
                            error.constraints[type] = message;
                        }
                    }
                    return;
                }
                // convert set and map into array
                const arrayValue = convertToArray(value);
                // Validation needs to be applied to each array item
                const validatedSubValues = arrayValue.map((subValue) => customConstraintMetadata.instance.validate(subValue, validationArguments));
                const validationIsAsync = validatedSubValues
                    .some((validatedSubValue) => isPromise(validatedSubValue));
                if (validationIsAsync) {
                    // Wrap plain values (if any) in promises, so that all are async
                    const asyncValidatedSubValues = validatedSubValues
                        .map((validatedSubValue) => isPromise(validatedSubValue) ? validatedSubValue : Promise.resolve(validatedSubValue));
                    const asyncValidationIsFinishedPromise = Promise.all(asyncValidatedSubValues)
                        .then((flatValidatedValues) => {
                        const validationResult = flatValidatedValues.every((isValid) => isValid);
                        if (!validationResult) {
                            const [type, message] = this.createValidationError(object, value, metadata, customConstraintMetadata);
                            error.constraints[type] = message;
                            if (metadata.context) {
                                if (!error.contexts) {
                                    error.contexts = {};
                                }
                                error.contexts[type] = Object.assign((error.contexts[type] || {}), metadata.context);
                            }
                        }
                    });
                    this.awaitingPromises.push(asyncValidationIsFinishedPromise);
                    return;
                }
                const validationResult = validatedSubValues.every((isValid) => isValid);
                if (!validationResult) {
                    const [type, message] = this.createValidationError(object, value, metadata, customConstraintMetadata);
                    error.constraints[type] = message;
                }
            });
        });
    }
    nestedValidations(value, metadatas, errors) {
        if (value === void 0) {
            return;
        }
        metadatas.forEach(metadata => {
            if (metadata.type !== ValidationTypes.NESTED_VALIDATION &&
                metadata.type !== ValidationTypes.PROMISE_VALIDATION) {
                return;
            }
            if (value instanceof Array || value instanceof Set || value instanceof Map) {
                // Treats Set as an array - as index of Set value is value itself and it is common case to have Object as value
                const arrayLikeValue = value instanceof Set ? Array.from(value) : value;
                arrayLikeValue.forEach((subValue, index) => {
                    this.performValidations(value, subValue, index.toString(), [], metadatas, errors);
                });
            }
            else if (value instanceof Object) {
                const targetSchema = typeof metadata.target === "string" ? metadata.target : metadata.target.name;
                this.execute(value, targetSchema, errors);
            }
            else {
                const error = new ValidationError();
                error.value = value;
                error.property = metadata.propertyName;
                error.target = metadata.target;
                const [type, message] = this.createValidationError(metadata.target, value, metadata);
                error.constraints = {
                    [type]: message
                };
                errors.push(error);
            }
        });
    }
    mapContexts(object, value, metadatas, error) {
        return metadatas
            .forEach(metadata => {
            if (metadata.context) {
                let customConstraint;
                if (metadata.type === ValidationTypes.CUSTOM_VALIDATION) {
                    const customConstraints = this.metadataStorage.getTargetValidatorConstraints(metadata.constraintCls);
                    customConstraint = customConstraints[0];
                }
                const type = this.getConstraintType(metadata, customConstraint);
                if (error.constraints[type]) {
                    if (!error.contexts) {
                        error.contexts = {};
                    }
                    error.contexts[type] = Object.assign((error.contexts[type] || {}), metadata.context);
                }
            }
        });
    }
    createValidationError(object, value, metadata, customValidatorMetadata) {
        const targetName = object.constructor ? object.constructor.name : undefined;
        const type = this.getConstraintType(metadata, customValidatorMetadata);
        const validationArguments = {
            targetName: targetName,
            property: metadata.propertyName,
            object: object,
            value: value,
            constraints: metadata.constraints
        };
        let message = metadata.message || "";
        if (!metadata.message &&
            (!this.validatorOptions || (this.validatorOptions && !this.validatorOptions.dismissDefaultMessages))) {
            if (customValidatorMetadata && customValidatorMetadata.instance.defaultMessage instanceof Function) {
                message = customValidatorMetadata.instance.defaultMessage(validationArguments);
            }
        }
        const messageString = ValidationUtils.replaceMessageSpecialTokens(message, validationArguments);
        return [type, messageString];
    }
    getConstraintType(metadata, customValidatorMetadata) {
        const type = customValidatorMetadata && customValidatorMetadata.name ? customValidatorMetadata.name : metadata.type;
        return type;
    }
}

/**
 * Validator performs validation of the given object based on its metadata.
 */
class Validator {
    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------
    /**
     * Performs validation of the given object based on decorators or validation schema.
     * Common method for `validateOrReject` and `validate` methods.
     */
    coreValidate(objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions) {
        const object = typeof objectOrSchemaName === "string" ? objectOrValidationOptions : objectOrSchemaName;
        const options = typeof objectOrSchemaName === "string" ? maybeValidatorOptions : objectOrValidationOptions;
        const schema = typeof objectOrSchemaName === "string" ? objectOrSchemaName : undefined;
        const executor = new ValidationExecutor(this, options);
        const validationErrors = [];
        executor.execute(object, schema, validationErrors);
        return Promise.all(executor.awaitingPromises).then(() => {
            return executor.stripEmptyErrors(validationErrors);
        });
    }
    /**
     * Performs validation of the given object based on decorators or validation schema.
     */
    validate(objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions) {
        return this.coreValidate(objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions);
    }
    /**
     * Performs validation of the given object based on decorators or validation schema and reject on error.
     */
    async validateOrReject(objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions) {
        const errors = await this.coreValidate(objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions);
        if (errors.length)
            return Promise.reject(errors);
    }
    /**
     * Performs validation of the given object based on decorators or validation schema.
     */
    validateSync(objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions) {
        const object = typeof objectOrSchemaName === "string" ? objectOrValidationOptions : objectOrSchemaName;
        const options = typeof objectOrSchemaName === "string" ? maybeValidatorOptions : objectOrValidationOptions;
        const schema = typeof objectOrSchemaName === "string" ? objectOrSchemaName : undefined;
        const executor = new ValidationExecutor(this, options);
        executor.ignoreAsyncValidations = true;
        const validationErrors = [];
        executor.execute(object, schema, validationErrors);
        return executor.stripEmptyErrors(validationErrors);
    }
}

/**
 * Container to be used by this library for inversion control. If container was not implicitly set then by default
 * container simply creates a new instance of the given class.
 */
const defaultContainer = new (class {
    constructor() {
        this.instances = [];
    }
    get(someClass) {
        let instance = this.instances.find(instance => instance.type === someClass);
        if (!instance) {
            instance = { type: someClass, object: new someClass() };
            this.instances.push(instance);
        }
        return instance.object;
    }
})();
let userContainer;
let userContainerOptions;
/**
 * Sets container to be used by this library.
 */
function useContainer(iocContainer, options) {
    userContainer = iocContainer;
    userContainerOptions = options;
}
/**
 * Gets the IOC container used by this library.
 */
function getFromContainer(someClass) {
    if (userContainer) {
        try {
            const instance = userContainer.get(someClass);
            if (instance)
                return instance;
            if (!userContainerOptions || !userContainerOptions.fallback)
                return instance;
        }
        catch (error) {
            if (!userContainerOptions || !userContainerOptions.fallbackOnErrors)
                throw error;
        }
    }
    return defaultContainer.get(someClass);
}

/**
 * If object has both allowed and not allowed properties a validation error will be thrown.
 */
function Allow(validationOptions) {
    return function (object, propertyName) {
        const args = {
            type: ValidationTypes.WHITELIST,
            target: object.constructor,
            propertyName: propertyName,
            validationOptions: validationOptions
        };
        getMetadataStorage().addValidationMetadata(new ValidationMetadata(args));
    };
}

/**
 * This metadata interface contains information for custom validators.
 */
class ConstraintMetadata {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(target, name, async = false) {
        this.target = target;
        this.name = name;
        this.async = async;
    }
    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------
    /**
     * Instance of the target custom validation class which performs validation.
     */
    get instance() {
        return getFromContainer(this.target);
    }
}

/**
 * Registers a custom validation decorator.
 */
function registerDecorator(options) {
    let constraintCls;
    if (options.validator instanceof Function) {
        constraintCls = options.validator;
        const constraintClasses = getFromContainer(MetadataStorage).getTargetValidatorConstraints(options.validator);
        if (constraintClasses.length > 1) {
            throw `More than one implementation of ValidatorConstraintInterface found for validator on: ${options.target}:${options.propertyName}`;
        }
    }
    else {
        const validator = options.validator;
        constraintCls = class CustomConstraint {
            validate(value, validationArguments) {
                return validator.validate(value, validationArguments);
            }
            defaultMessage(validationArguments) {
                if (validator.defaultMessage) {
                    return validator.defaultMessage(validationArguments);
                }
                return "";
            }
        };
        getMetadataStorage().addConstraintMetadata(new ConstraintMetadata(constraintCls, options.name, options.async));
    }
    const validationMetadataArgs = {
        type: options.name && ValidationTypes.isValid(options.name) ? options.name : ValidationTypes.CUSTOM_VALIDATION,
        target: options.target,
        propertyName: options.propertyName,
        validationOptions: options.options,
        constraintCls: constraintCls,
        constraints: options.constraints
    };
    getMetadataStorage().addValidationMetadata(new ValidationMetadata(validationMetadataArgs));
}

function buildMessage(impl, validationOptions) {
    return (validationArguments) => {
        const eachPrefix = validationOptions && validationOptions.each
            ? "each value in "
            : "";
        return impl(eachPrefix, validationArguments);
    };
}
function ValidateBy(options, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: options.name,
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: options.constraints,
            validator: options.validator
        });
    };
}

// isDefined is (yet) a special case
const IS_DEFINED = ValidationTypes.IS_DEFINED;
/**
 * Checks if value is defined (!== undefined, !== null).
 */
function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * Checks if value is defined (!== undefined, !== null).
 */
function IsDefined(validationOptions) {
    return ValidateBy({
        name: IS_DEFINED,
        validator: {
            validate: (value) => isDefined(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property should not be null or undefined", validationOptions)
        }
    }, validationOptions);
}

/**
 * Checks if value is missing and if so, ignores all validators.
 */
function IsOptional(validationOptions) {
    return function (object, propertyName) {
        const args = {
            type: ValidationTypes.CONDITIONAL_VALIDATION,
            target: object.constructor,
            propertyName: propertyName,
            constraints: [(object, value) => {
                    return object[propertyName] !== null && object[propertyName] !== undefined;
                }],
            validationOptions: validationOptions
        };
        getMetadataStorage().addValidationMetadata(new ValidationMetadata(args));
    };
}

/**
 * Registers custom validator class.
 */
function ValidatorConstraint(options) {
    return function (target) {
        const isAsync = options && options.async ? true : false;
        let name = options && options.name ? options.name : "";
        if (!name) {
            name = target.name;
            if (!name) // generate name if it was not given
                name = name.replace(/\.?([A-Z]+)/g, (x, y) => "_" + y.toLowerCase()).replace(/^_/, "");
        }
        const metadata = new ConstraintMetadata(target, name, isAsync);
        getMetadataStorage().addConstraintMetadata(metadata);
    };
}
function Validate(constraintClass, constraintsOrValidationOptions, maybeValidationOptions) {
    return function (object, propertyName) {
        const args = {
            type: ValidationTypes.CUSTOM_VALIDATION,
            target: object.constructor,
            propertyName: propertyName,
            constraintCls: constraintClass,
            constraints: constraintsOrValidationOptions instanceof Array ? constraintsOrValidationOptions : undefined,
            validationOptions: !(constraintsOrValidationOptions instanceof Array) ? constraintsOrValidationOptions : maybeValidationOptions
        };
        getMetadataStorage().addValidationMetadata(new ValidationMetadata(args));
    };
}

/**
 * Objects / object arrays marked with this decorator will also be validated.
 */
function ValidateIf(condition, validationOptions) {
    return function (object, propertyName) {
        const args = {
            type: ValidationTypes.CONDITIONAL_VALIDATION,
            target: object.constructor,
            propertyName: propertyName,
            constraints: [condition],
            validationOptions: validationOptions
        };
        getMetadataStorage().addValidationMetadata(new ValidationMetadata(args));
    };
}

/**
 * Objects / object arrays marked with this decorator will also be validated.
 */
function ValidateNested(validationOptions) {
    const opts = { ...validationOptions };
    const eachPrefix = opts.each ? "each value in " : "";
    opts.message = opts.message || eachPrefix + "nested property $property must be either object or array";
    return function (object, propertyName) {
        const args = {
            type: ValidationTypes.NESTED_VALIDATION,
            target: object.constructor,
            propertyName: propertyName,
            validationOptions: opts,
        };
        getMetadataStorage().addValidationMetadata(new ValidationMetadata(args));
    };
}

/**
 * Resolve promise before validation
 */
function ValidatePromise(validationOptions) {
    return function (object, propertyName) {
        const args = {
            type: ValidationTypes.PROMISE_VALIDATION,
            target: object.constructor,
            propertyName: propertyName,
            validationOptions: validationOptions,
        };
        getMetadataStorage().addValidationMetadata(new ValidationMetadata(args));
    };
}

const IS_LATLONG = "isLatLong";
/**
 * Checks if a value is string in format a "latitude,longitude".
 */
function isLatLong(value) {
    return typeof value === "string" && validator.isLatLong(value);
}
/**
 * Checks if a value is string in format a "latitude,longitude".
 */
function IsLatLong(validationOptions) {
    return ValidateBy({
        name: IS_LATLONG,
        validator: {
            validate: (value, args) => isLatLong(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a latitude,longitude string", validationOptions)
        }
    }, validationOptions);
}

const IS_LATITUDE = "isLatitude";
/**
 * Checks if a given value is a latitude.
 */
function isLatitude(value) {
    return (typeof value === "number" || typeof value === "string") && isLatLong(`${value},0`);
}
/**
 * Checks if a given value is a latitude.
 */
function IsLatitude(validationOptions) {
    return ValidateBy({
        name: IS_LATITUDE,
        validator: {
            validate: (value, args) => isLatitude(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a latitude string or number", validationOptions)
        }
    }, validationOptions);
}

const IS_LONGITUDE = "isLongitude";
/**
 * Checks if a given value is a longitude.
 */
function isLongitude(value) {
    return (typeof value === "number" || typeof value === "string") && isLatLong(`0,${value}`);
}
/**
 * Checks if a given value is a longitude.
 */
function IsLongitude(validationOptions) {
    return ValidateBy({
        name: IS_LONGITUDE,
        validator: {
            validate: (value, args) => isLongitude(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a longitude string or number", validationOptions)
        }
    }, validationOptions);
}

const EQUALS = "equals";
/**
 * Checks if value matches ("===") the comparison.
 */
function equals(value, comparison) {
    return value === comparison;
}
/**
 * Checks if value matches ("===") the comparison.
 */
function Equals(comparison, validationOptions) {
    return ValidateBy({
        name: EQUALS,
        constraints: [comparison],
        validator: {
            validate: (value, args) => equals(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be equal to $constraint1", validationOptions)
        }
    }, validationOptions);
}

const NOT_EQUALS = "notEquals";
/**
 * Checks if value does not match ("!==") the comparison.
 */
function notEquals(value, comparison) {
    return value !== comparison;
}
/**
 * Checks if value does not match ("!==") the comparison.
 */
function NotEquals(comparison, validationOptions) {
    return ValidateBy({
        name: NOT_EQUALS,
        constraints: [comparison],
        validator: {
            validate: (value, args) => notEquals(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property should not be equal to $constraint1", validationOptions)
        }
    }, validationOptions);
}

const IS_EMPTY = "isEmpty";
/**
 * Checks if given value is empty (=== '', === null, === undefined).
 */
function isEmpty(value) {
    return value === "" || value === null || value === undefined;
}
/**
 * Checks if given value is empty (=== '', === null, === undefined).
 */
function IsEmpty(validationOptions) {
    return ValidateBy({
        name: IS_EMPTY,
        validator: {
            validate: (value, args) => isEmpty(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be empty", validationOptions)
        }
    }, validationOptions);
}

const IS_NOT_EMPTY = "isNotEmpty";
/**
 * Checks if given value is not empty (!== '', !== null, !== undefined).
 */
function isNotEmpty(value) {
    return value !== "" && value !== null && value !== undefined;
}
/**
 * Checks if given value is not empty (!== '', !== null, !== undefined).
 */
function IsNotEmpty(validationOptions) {
    return ValidateBy({
        name: IS_NOT_EMPTY,
        validator: {
            validate: (value, args) => isNotEmpty(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property should not be empty", validationOptions)
        }
    }, validationOptions);
}

const IS_IN = "isIn";
/**
 * Checks if given value is in a array of allowed values.
 */
function isIn(value, possibleValues) {
    return !(possibleValues instanceof Array) || possibleValues.some(possibleValue => possibleValue === value);
}
/**
 * Checks if given value is in a array of allowed values.
 */
function IsIn(values, validationOptions) {
    return ValidateBy({
        name: IS_IN,
        constraints: [values],
        validator: {
            validate: (value, args) => isIn(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be one of the following values: $constraint1", validationOptions)
        }
    }, validationOptions);
}

const IS_NOT_IN = "isNotIn";
/**
 * Checks if given value not in a array of allowed values.
 */
function isNotIn(value, possibleValues) {
    return !(possibleValues instanceof Array) || !possibleValues.some(possibleValue => possibleValue === value);
}
/**
 * Checks if given value not in a array of allowed values.
 */
function IsNotIn(values, validationOptions) {
    return ValidateBy({
        name: IS_NOT_IN,
        constraints: [values],
        validator: {
            validate: (value, args) => isNotIn(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property should not be one of the following values: $constraint1", validationOptions)
        }
    }, validationOptions);
}

const IS_DIVISIBLE_BY = "isDivisibleBy";
/**
 * Checks if value is a number that's divisible by another.
 */
function isDivisibleBy(value, num) {
    return typeof value === "number" &&
        typeof num === "number" &&
        validator.isDivisibleBy(String(value), num);
}
/**
 * Checks if value is a number that's divisible by another.
 */
function IsDivisibleBy(num, validationOptions) {
    return ValidateBy({
        name: IS_DIVISIBLE_BY,
        constraints: [num],
        validator: {
            validate: (value, args) => isDivisibleBy(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be divisible by $constraint1", validationOptions)
        }
    }, validationOptions);
}

const IS_POSITIVE = "isPositive";
/**
 * Checks if the value is a positive number greater than zero.
 */
function isPositive(value) {
    return typeof value === "number" && value > 0;
}
/**
 * Checks if the value is a positive number greater than zero.
 */
function IsPositive(validationOptions) {
    return ValidateBy({
        name: IS_POSITIVE,
        validator: {
            validate: (value, args) => isPositive(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a positive number", validationOptions)
        }
    }, validationOptions);
}

const IS_NEGATIVE = "isNegative";
/**
 * Checks if the value is a negative number smaller than zero.
 */
function isNegative(value) {
    return typeof value === "number" && value < 0;
}
/**
 * Checks if the value is a negative number smaller than zero.
 */
function IsNegative(validationOptions) {
    return ValidateBy({
        name: IS_NEGATIVE,
        validator: {
            validate: (value, args) => isNegative(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a negative number", validationOptions)
        }
    }, validationOptions);
}

const MAX = "max";
/**
 * Checks if the first number is less than or equal to the second.
 */
function max(num, max) {
    return typeof num === "number" && typeof max === "number" && num <= max;
}
/**
 * Checks if the first number is less than or equal to the second.
 */
function Max(maxValue, validationOptions) {
    return ValidateBy({
        name: MAX,
        constraints: [maxValue],
        validator: {
            validate: (value, args) => max(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must not be greater than $constraint1", validationOptions)
        }
    }, validationOptions);
}

const MIN = "min";
/**
 * Checks if the first number is greater than or equal to the second.
 */
function min(num, min) {
    return typeof num === "number" && typeof min === "number" && num >= min;
}
/**
 * Checks if the first number is greater than or equal to the second.
 */
function Min(minValue, validationOptions) {
    return ValidateBy({
        name: MIN,
        constraints: [minValue],
        validator: {
            validate: (value, args) => min(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must not be less than $constraint1", validationOptions)
        }
    }, validationOptions);
}

const MIN_DATE = "minDate";
/**
 * Checks if the value is a date that's after the specified date.
 */
function minDate(date, minDate) {
    return date instanceof Date && date.getTime() >= minDate.getTime();
}
/**
 * Checks if the value is a date that's after the specified date.
 */
function MinDate(date, validationOptions) {
    return ValidateBy({
        name: MIN_DATE,
        constraints: [date],
        validator: {
            validate: (value, args) => minDate(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => "minimal allowed date for " + eachPrefix + "$property is $constraint1", validationOptions)
        }
    }, validationOptions);
}

const MAX_DATE = "maxDate";
/**
* Checks if the value is a date that's before the specified date.
*/
function maxDate(date, maxDate) {
    return date instanceof Date && date.getTime() <= maxDate.getTime();
}
/**
 * Checks if the value is a date that's after the specified date.
 */
function MaxDate(date, validationOptions) {
    return ValidateBy({
        name: MAX_DATE,
        constraints: [date],
        validator: {
            validate: (value, args) => maxDate(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => "maximal allowed date for " + eachPrefix + "$property is $constraint1", validationOptions)
        }
    }, validationOptions);
}

const CONTAINS = "contains";
/**
 * Checks if the string contains the seed.
 * If given value is not a string, then it returns false.
 */
function contains(value, seed) {
    return typeof value === "string" && validator.contains(value, seed);
}
/**
 * Checks if the string contains the seed.
 * If given value is not a string, then it returns false.
 */
function Contains(seed, validationOptions) {
    return ValidateBy({
        name: CONTAINS,
        constraints: [seed],
        validator: {
            validate: (value, args) => contains(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain a $constraint1 string", validationOptions)
        }
    }, validationOptions);
}

const NOT_CONTAINS = "notContains";
/**
 * Checks if the string does not contain the seed.
 * If given value is not a string, then it returns false.
 */
function notContains(value, seed) {
    return typeof value === "string" && !validator.contains(value, seed);
}
/**
 * Checks if the string does not contain the seed.
 * If given value is not a string, then it returns false.
 */
function NotContains(seed, validationOptions) {
    return ValidateBy({
        name: NOT_CONTAINS,
        constraints: [seed],
        validator: {
            validate: (value, args) => notContains(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property should not contain a $constraint1 string", validationOptions)
        }
    }, validationOptions);
}

const IS_ALPHA = "isAlpha";
/**
 * Checks if the string contains only letters (a-zA-Z).
 * If given value is not a string, then it returns false.
 */
function isAlpha(value, locale) {
    return typeof value === "string" && validator.isAlpha(value, locale);
}
/**
 * Checks if the string contains only letters (a-zA-Z).
 * If given value is not a string, then it returns false.
 */
function IsAlpha(locale, validationOptions) {
    return ValidateBy({
        name: IS_ALPHA,
        constraints: [locale],
        validator: {
            validate: (value, args) => isAlpha(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain only letters (a-zA-Z)", validationOptions)
        }
    }, validationOptions);
}

const IS_ALPHANUMERIC = "isAlphanumeric";
/**
 * Checks if the string contains only letters and numbers.
 * If given value is not a string, then it returns false.
 */
function isAlphanumeric(value, locale) {
    return typeof value === "string" && validator.isAlphanumeric(value, locale);
}
/**
 * Checks if the string contains only letters and numbers.
 * If given value is not a string, then it returns false.
 */
function IsAlphanumeric(locale, validationOptions) {
    return ValidateBy({
        name: IS_ALPHANUMERIC,
        constraints: [locale],
        validator: {
            validate: (value, args) => isAlphanumeric(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain only letters and numbers", validationOptions)
        }
    }, validationOptions);
}

const IS_DECIMAL = "isDecimal";
/**
 * Checks if the string is a valid decimal.
 * If given value is not a string, then it returns false.
 */
function isDecimal(value, options) {
    return typeof value === "string" && validator.isDecimal(value, options);
}
/**
 * Checks if the string contains only letters and numbers.
 * If given value is not a string, then it returns false.
 */
function IsDecimal(options, validationOptions) {
    return ValidateBy({
        name: IS_DECIMAL,
        constraints: [options],
        validator: {
            validate: (value, args) => isDecimal(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property is not a valid decimal number.", validationOptions)
        }
    }, validationOptions);
}

const IS_ASCII = "isAscii";
/**
 * Checks if the string contains ASCII chars only.
 * If given value is not a string, then it returns false.
 */
function isAscii(value) {
    return typeof value === "string" && validator.isAscii(value);
}
/**
 * Checks if the string contains ASCII chars only.
 * If given value is not a string, then it returns false.
 */
function IsAscii(validationOptions) {
    return ValidateBy({
        name: IS_ASCII,
        validator: {
            validate: (value, args) => isAscii(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain only ASCII characters", validationOptions)
        }
    }, validationOptions);
}

const IS_BASE64 = "isBase64";
/**
 * Checks if a string is base64 encoded.
 * If given value is not a string, then it returns false.
 */
function isBase64(value) {
    return typeof value === "string" && validator.isBase64(value);
}
/**
 * Checks if a string is base64 encoded.
 * If given value is not a string, then it returns false.
 */
function IsBase64(validationOptions) {
    return ValidateBy({
        name: IS_BASE64,
        validator: {
            validate: (value, args) => isBase64(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be base64 encoded", validationOptions)
        }
    }, validationOptions);
}

const IS_BYTE_LENGTH = "isByteLength";
/**
 * Checks if the string's length (in bytes) falls in a range.
 * If given value is not a string, then it returns false.
 */
function isByteLength(value, min, max) {
    return typeof value === "string" && validator.isByteLength(value, { min, max });
}
/**
 * Checks if the string's length (in bytes) falls in a range.
 * If given value is not a string, then it returns false.
 */
function IsByteLength(min, max, validationOptions) {
    return ValidateBy({
        name: IS_BYTE_LENGTH,
        constraints: [min, max],
        validator: {
            validate: (value, args) => isByteLength(value, args.constraints[0], args.constraints[1]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property's byte length must fall into ($constraint1, $constraint2) range", validationOptions)
        }
    }, validationOptions);
}

const IS_CREDIT_CARD = "isCreditCard";
/**
 * Checks if the string is a credit card.
 * If given value is not a string, then it returns false.
 */
function isCreditCard(value) {
    return typeof value === "string" && validator.isCreditCard(value);
}
/**
 * Checks if the string is a credit card.
 * If given value is not a string, then it returns false.
 */
function IsCreditCard(validationOptions) {
    return ValidateBy({
        name: IS_CREDIT_CARD,
        validator: {
            validate: (value, args) => isCreditCard(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a credit card", validationOptions)
        }
    }, validationOptions);
}

const IS_CURRENCY = "isCurrency";
/**
 * Checks if the string is a valid currency amount.
 * If given value is not a string, then it returns false.
 */
function isCurrency(value, options) {
    return typeof value === "string" && validator.isCurrency(value, options);
}
/**
 * Checks if the string is a valid currency amount.
 * If given value is not a string, then it returns false.
 */
function IsCurrency(options, validationOptions) {
    return ValidateBy({
        name: IS_CURRENCY,
        constraints: [options],
        validator: {
            validate: (value, args) => isCurrency(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a currency", validationOptions)
        }
    }, validationOptions);
}

const IS_EMAIL = "isEmail";
/**
 * Checks if the string is an email.
 * If given value is not a string, then it returns false.
 */
function isEmail(value, options) {
    return typeof value === "string" && validator.isEmail(value, options);
}
/**
 * Checks if the string is an email.
 * If given value is not a string, then it returns false.
 */
function IsEmail(options, validationOptions) {
    return ValidateBy({
        name: IS_EMAIL,
        constraints: [options],
        validator: {
            validate: (value, args) => isEmail(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an email", validationOptions)
        }
    }, validationOptions);
}

const IS_FQDN = "isFqdn";
/**
 * Checks if the string is a fully qualified domain name (e.g. domain.com).
 * If given value is not a string, then it returns false.
 */
function isFQDN(value, options) {
    return typeof value === "string" && validator.isFQDN(value, options);
}
/**
 * Checks if the string is a fully qualified domain name (e.g. domain.com).
 * If given value is not a string, then it returns false.
 */
function IsFQDN(options, validationOptions) {
    return ValidateBy({
        name: IS_FQDN,
        constraints: [options],
        validator: {
            validate: (value, args) => isFQDN(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a valid domain name", validationOptions)
        }
    }, validationOptions);
}

const IS_FULL_WIDTH = "isFullWidth";
/**
 * Checks if the string contains any full-width chars.
 * If given value is not a string, then it returns false.
 */
function isFullWidth(value) {
    return typeof value === "string" && validator.isFullWidth(value);
}
/**
 * Checks if the string contains any full-width chars.
 * If given value is not a string, then it returns false.
 */
function IsFullWidth(validationOptions) {
    return ValidateBy({
        name: IS_FULL_WIDTH,
        validator: {
            validate: (value, args) => isFullWidth(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain a full-width characters", validationOptions)
        }
    }, validationOptions);
}

const IS_HALF_WIDTH = "isHalfWidth";
/**
 * Checks if the string contains any half-width chars.
 * If given value is not a string, then it returns false.
 */
function isHalfWidth(value) {
    return typeof value === "string" && validator.isHalfWidth(value);
}
/**
 * Checks if the string contains any full-width chars.
 * If given value is not a string, then it returns false.
 */
function IsHalfWidth(validationOptions) {
    return ValidateBy({
        name: IS_HALF_WIDTH,
        validator: {
            validate: (value, args) => isHalfWidth(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain a half-width characters", validationOptions)
        }
    }, validationOptions);
}

const IS_VARIABLE_WIDTH = "isVariableWidth";
/**
 * Checks if the string contains variable-width chars.
 * If given value is not a string, then it returns false.
 */
function isVariableWidth(value) {
    return typeof value === "string" && validator.isVariableWidth(value);
}
/**
 * Checks if the string contains variable-width chars.
 * If given value is not a string, then it returns false.
 */
function IsVariableWidth(validationOptions) {
    return ValidateBy({
        name: IS_VARIABLE_WIDTH,
        validator: {
            validate: (value, args) => isVariableWidth(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain a full-width and half-width characters", validationOptions)
        }
    }, validationOptions);
}

const IS_HEX_COLOR = "isHexColor";
/**
 * Checks if the string is a hexadecimal color.
 * If given value is not a string, then it returns false.
 */
function isHexColor(value) {
    return typeof value === "string" && validator.isHexColor(value);
}
/**
 * Checks if the string is a hexadecimal color.
 * If given value is not a string, then it returns false.
 */
function IsHexColor(validationOptions) {
    return ValidateBy({
        name: IS_HEX_COLOR,
        validator: {
            validate: (value, args) => isHexColor(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a hexadecimal color", validationOptions)
        }
    }, validationOptions);
}

const IS_HEXADECIMAL = "isHexadecimal";
/**
 * Checks if the string is a hexadecimal number.
 * If given value is not a string, then it returns false.
 */
function isHexadecimal(value) {
    return typeof value === "string" && validator.isHexadecimal(value);
}
/**
 * Checks if the string is a hexadecimal number.
 * If given value is not a string, then it returns false.
 */
function IsHexadecimal(validationOptions) {
    return ValidateBy({
        name: IS_HEXADECIMAL,
        validator: {
            validate: (value, args) => isHexadecimal(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a hexadecimal number", validationOptions)
        }
    }, validationOptions);
}

function isValidationOptions(val) {
    if (!val) {
        return false;
    }
    return "each" in val
        || "message" in val
        || "groups" in val
        || "always" in val
        || "context" in val;
}

const IS_MAC_ADDRESS = "isMacAddress";
/**
 * Check if the string is a MAC address.
 * If given value is not a string, then it returns false.
 */
function isMACAddress(value, options) {
    return typeof value === "string" && validator.isMACAddress(value, options);
}
function IsMACAddress(optionsOrValidationOptionsArg, validationOptionsArg) {
    const options = !isValidationOptions(optionsOrValidationOptionsArg) ? optionsOrValidationOptionsArg : undefined;
    const validationOptions = isValidationOptions(optionsOrValidationOptionsArg) ? optionsOrValidationOptionsArg : validationOptionsArg;
    return ValidateBy({
        name: IS_MAC_ADDRESS,
        constraints: [options],
        validator: {
            validate: (value, args) => isMACAddress(value, options),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a MAC Address", validationOptions)
        }
    }, validationOptions);
}

const IS_IP = "isIp";
/**
 * Checks if the string is an IP (version 4 or 6).
 * If given value is not a string, then it returns false.
 */
function isIP(value, version) {
    const versionStr = version ? `${version}` : undefined;
    return typeof value === "string" && validator.isIP(value, versionStr);
}
/**
 * Checks if the string is an IP (version 4 or 6).
 * If given value is not a string, then it returns false.
 */
function IsIP(version, validationOptions) {
    return ValidateBy({
        name: IS_IP,
        constraints: [version],
        validator: {
            validate: (value, args) => isIP(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an ip address", validationOptions)
        }
    }, validationOptions);
}

const IS_PORT = "isPort";
/**
 * Check if the string is a valid port number.
 */
function isPort(value) {
    return typeof value === "string" && validator.isPort(value);
}
/**
 * Check if the string is a valid port number.
 */
function IsPort(validationOptions) {
    return ValidateBy({
        name: IS_PORT,
        validator: {
            validate: (value, args) => isPort(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a port", validationOptions)
        }
    }, validationOptions);
}

const IS_ISBN = "isIsbn";
/**
 * Checks if the string is an ISBN (version 10 or 13).
 * If given value is not a string, then it returns false.
 */
function isISBN(value, version) {
    const versionStr = version ? `${version}` : undefined;
    return typeof value === "string" && validator.isISBN(value, versionStr);
}
/**
 * Checks if the string is an ISBN (version 10 or 13).
 * If given value is not a string, then it returns false.
 */
function IsISBN(version, validationOptions) {
    return ValidateBy({
        name: IS_ISBN,
        constraints: [version],
        validator: {
            validate: (value, args) => isISBN(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an ISBN", validationOptions)
        }
    }, validationOptions);
}

const IS_ISIN = "isIsin";
/**
 * Checks if the string is an ISIN (stock/security identifier).
 * If given value is not a string, then it returns false.
 */
function isISIN(value) {
    return typeof value === "string" && validator.isISIN(value);
}
/**
 * Checks if the string is an ISIN (stock/security identifier).
 * If given value is not a string, then it returns false.
 */
function IsISIN(validationOptions) {
    return ValidateBy({
        name: IS_ISIN,
        validator: {
            validate: (value, args) => isISIN(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an ISIN (stock/security identifier)", validationOptions)
        }
    }, validationOptions);
}

const IS_ISO8601 = "isIso8601";
/**
 * Checks if the string is a valid ISO 8601 date.
 * If given value is not a string, then it returns false.
 * Use the option strict = true for additional checks for a valid date, e.g. invalidates dates like 2019-02-29.
 */
function isISO8601(value, options) {
    return typeof value === "string" && validator.isISO8601(value, options);
}
/**
 * Checks if the string is a valid ISO 8601 date.
 * If given value is not a string, then it returns false.
 * Use the option strict = true for additional checks for a valid date, e.g. invalidates dates like 2019-02-29.
 */
function IsISO8601(options, validationOptions) {
    return ValidateBy({
        name: IS_ISO8601,
        constraints: [options],
        validator: {
            validate: (value, args) => isISO8601(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a valid ISO 8601 date string", validationOptions)
        }
    }, validationOptions);
}

const IS_JSON = "isJson";
/**
 * Checks if the string is valid JSON (note: uses JSON.parse).
 * If given value is not a string, then it returns false.
 */
function isJSON(value) {
    return typeof value === "string" && validator.isJSON(value);
}
/**
 * Checks if the string is valid JSON (note: uses JSON.parse).
 * If given value is not a string, then it returns false.
 */
function IsJSON(validationOptions) {
    return ValidateBy({
        name: IS_JSON,
        validator: {
            validate: (value, args) => isJSON(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a json string", validationOptions)
        }
    }, validationOptions);
}

const IS_JWT = "isJwt";
/**
 * Checks if the string is valid JWT token.
 * If given value is not a string, then it returns false.
 */
function isJWT(value) {
    return typeof value === "string" && validator.isJWT(value);
}
/**
 * Checks if the string is valid JWT token.
 * If given value is not a string, then it returns false.
 */
function IsJWT(validationOptions) {
    return ValidateBy({
        name: IS_JWT,
        validator: {
            validate: (value, args) => isJWT(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a jwt string", validationOptions)
        }
    }, validationOptions);
}

const IS_LOWERCASE = "isLowercase";
/**
 * Checks if the string is lowercase.
 * If given value is not a string, then it returns false.
 */
function isLowercase(value) {
    return typeof value === "string" && validator.isLowercase(value);
}
/**
 * Checks if the string is lowercase.
 * If given value is not a string, then it returns false.
 */
function IsLowercase(validationOptions) {
    return ValidateBy({
        name: IS_LOWERCASE,
        validator: {
            validate: (value, args) => isLowercase(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a lowercase string", validationOptions)
        }
    }, validationOptions);
}

const IS_MOBILE_PHONE = "isMobilePhone";
/**
 * Checks if the string is a mobile phone number (locale is either an array of locales (e.g ['sk-SK', 'sr-RS'])
 * OR one of ['am-Am', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN', 'be-BY',
 * 'bg-BG', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'de-AT', 'el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK',
 * 'en-MO', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-UG',
 * 'en-US', 'en-TZ', 'en-ZA', 'en-ZM', 'es-CL', 'es-CR', 'es-EC', 'es-ES', 'es-MX', 'es-PA', 'es-PY', 'es-UY', 'et-EE',
 * 'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'he-IL', 'hu-HU', 'id-ID',
 * 'it-IT', 'ja-JP', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL',
 * 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sl-SI', 'sk-SK', 'sr-RS', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN',
 * 'zh-HK', 'zh-MO', 'zh-TW']
 * If given value is not a string, then it returns false.
 */
function isMobilePhone(value, locale, options) {
    return typeof value === "string" && validator.isMobilePhone(value, locale, options);
}
/**
 * Checks if the string is a mobile phone number (locale is either an array of locales (e.g ['sk-SK', 'sr-RS'])
 * OR one of ['am-Am', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN', 'be-BY',
 * 'bg-BG', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'de-AT', 'el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK',
 * 'en-MO', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-UG',
 * 'en-US', 'en-TZ', 'en-ZA', 'en-ZM', 'es-CL', 'es-CR', 'es-EC', 'es-ES', 'es-MX', 'es-PA', 'es-PY', 'es-UY', 'et-EE',
 * 'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'he-IL', 'hu-HU', 'id-ID',
 * 'it-IT', 'ja-JP', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL',
 * 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sl-SI', 'sk-SK', 'sr-RS', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN',
 * 'zh-HK', 'zh-MO', 'zh-TW']
 * If given value is not a string, then it returns false.
 */
function IsMobilePhone(locale, options, validationOptions) {
    return ValidateBy({
        name: IS_MOBILE_PHONE,
        constraints: [locale, options],
        validator: {
            validate: (value, args) => isMobilePhone(value, args.constraints[0], args.constraints[1]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a phone number", validationOptions)
        }
    }, validationOptions);
}

const IS_ISO31661_ALPHA_2 = "isISO31661Alpha2";
/**
 * Check if the string is a valid [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) officially assigned country code.
 */
function isISO31661Alpha2(value) {
    return typeof value === "string" && validator.isISO31661Alpha2(value);
}
/**
 * Check if the string is a valid [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) officially assigned country code.
 */
function IsISO31661Alpha2(validationOptions) {
    return ValidateBy({
        name: IS_ISO31661_ALPHA_2,
        validator: {
            validate: (value, args) => isISO31661Alpha2(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a valid ISO31661 Alpha2 code", validationOptions)
        }
    }, validationOptions);
}

const IS_ISO31661_ALPHA_3 = "isISO31661Alpha3";
/**
 * Check if the string is a valid [ISO 3166-1 alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) officially assigned country code.
 */
function isISO31661Alpha3(value) {
    return typeof value === "string" && validator.isISO31661Alpha3(value);
}
/**
 * Check if the string is a valid [ISO 3166-1 alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) officially assigned country code.
 */
function IsISO31661Alpha3(validationOptions) {
    return ValidateBy({
        name: IS_ISO31661_ALPHA_3,
        validator: {
            validate: (value, args) => isISO31661Alpha3(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a valid ISO31661 Alpha3 code", validationOptions)
        }
    }, validationOptions);
}

const IS_MONGO_ID = "isMongoId";
/**
 * Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId.
 * If given value is not a string, then it returns false.
 */
function isMongoId(value) {
    return typeof value === "string" && validator.isMongoId(value);
}
/**
 * Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId.
 * If given value is not a string, then it returns false.
 */
function IsMongoId(validationOptions) {
    return ValidateBy({
        name: IS_MONGO_ID,
        validator: {
            validate: (value, args) => isMongoId(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a mongodb id", validationOptions)
        }
    }, validationOptions);
}

const IS_MULTIBYTE = "isMultibyte";
/**
 * Checks if the string contains one or more multibyte chars.
 * If given value is not a string, then it returns false.
 */
function isMultibyte(value) {
    return typeof value === "string" && validator.isMultibyte(value);
}
/**
 * Checks if the string contains one or more multibyte chars.
 * If given value is not a string, then it returns false.
 */
function IsMultibyte(validationOptions) {
    return ValidateBy({
        name: IS_MULTIBYTE,
        validator: {
            validate: (value, args) => isMultibyte(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain one or more multibyte chars", validationOptions)
        }
    }, validationOptions);
}

const IS_SURROGATE_PAIR = "isSurrogatePair";
/**
 * Checks if the string contains any surrogate pairs chars.
 * If given value is not a string, then it returns false.
 */
function isSurrogatePair(value) {
    return typeof value === "string" && validator.isSurrogatePair(value);
}
/**
 * Checks if the string contains any surrogate pairs chars.
 * If given value is not a string, then it returns false.
 */
function IsSurrogatePair(validationOptions) {
    return ValidateBy({
        name: IS_SURROGATE_PAIR,
        validator: {
            validate: (value, args) => isSurrogatePair(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain any surrogate pairs chars", validationOptions)
        }
    }, validationOptions);
}

const IS_URL = "isUrl";
/**
 * Checks if the string is an url.
 * If given value is not a string, then it returns false.
 */
function isURL(value, options) {
    return typeof value === "string" && validator.isURL(value, options);
}
/**
 * Checks if the string is an url.
 * If given value is not a string, then it returns false.
 */
function IsUrl(options, validationOptions) {
    return ValidateBy({
        name: IS_URL,
        constraints: [options],
        validator: {
            validate: (value, args) => isURL(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an URL address", validationOptions)
        }
    }, validationOptions);
}

const IS_UUID = "isUuid";
/**
 * Checks if the string is a UUID (version 3, 4 or 5).
 * If given value is not a string, then it returns false.
 */
function isUUID(value, version) {
    return typeof value === "string" && validator.isUUID(value, version);
}
/**
 * Checks if the string is a UUID (version 3, 4 or 5).
 * If given value is not a string, then it returns false.
 */
function IsUUID(version, validationOptions) {
    return ValidateBy({
        name: IS_UUID,
        constraints: [version],
        validator: {
            validate: (value, args) => isUUID(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an UUID", validationOptions)
        }
    }, validationOptions);
}

const IS_FIREBASE_PUSH_ID = "IsFirebasePushId";
/**
 * Checks if the string is a Firebase Push Id
 * If given value is not a Firebase Push Id, it returns false
 */
function isFirebasePushId(value) {
    const webSafeRegex = /^[a-zA-Z0-9_-]*$/;
    return typeof value === "string" && value.length === 20 && webSafeRegex.test(value);
}
/**
 * Checks if the string is a Firebase Push Id
 * If given value is not a Firebase Push Id, it returns false
 */
function IsFirebasePushId(validationOptions) {
    return ValidateBy({
        name: IS_FIREBASE_PUSH_ID,
        validator: {
            validate: (value, args) => isFirebasePushId(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a Firebase Push Id", validationOptions)
        }
    }, validationOptions);
}

const IS_UPPERCASE = "isUppercase";
/**
 * Checks if the string is uppercase.
 * If given value is not a string, then it returns false.
 */
function isUppercase(value) {
    return typeof value === "string" && validator.isUppercase(value);
}
/**
 * Checks if the string is uppercase.
 * If given value is not a string, then it returns false.
 */
function IsUppercase(validationOptions) {
    return ValidateBy({
        name: IS_UPPERCASE,
        validator: {
            validate: (value, args) => isUppercase(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be uppercase", validationOptions)
        }
    }, validationOptions);
}

const LENGTH = "length";
/**
 * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
function length(value, min, max) {
    return typeof value === "string" && validator.isLength(value, { min, max });
}
/**
 * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
function Length(min, max, validationOptions) {
    return ValidateBy({
        name: LENGTH,
        constraints: [min, max],
        validator: {
            validate: (value, args) => length(value, args.constraints[0], args.constraints[1]),
            defaultMessage: buildMessage((eachPrefix, args) => {
                const isMinLength = args.constraints[0] !== null && args.constraints[0] !== undefined;
                const isMaxLength = args.constraints[1] !== null && args.constraints[1] !== undefined;
                if (isMinLength && (!args.value || args.value.length < args.constraints[0])) {
                    return eachPrefix + "$property must be longer than or equal to $constraint1 characters";
                }
                else if (isMaxLength && (args.value.length > args.constraints[1])) {
                    return eachPrefix + "$property must be shorter than or equal to $constraint2 characters";
                }
                return eachPrefix + "$property must be longer than or equal to $constraint1 and shorter than or equal to $constraint2 characters";
            }, validationOptions)
        }
    }, validationOptions);
}

const MAX_LENGTH = "maxLength";
/**
 * Checks if the string's length is not more than given number. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
function maxLength(value, max) {
    return typeof value === "string" && validator.isLength(value, { min: 0, max });
}
/**
 * Checks if the string's length is not more than given number. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
function MaxLength(max, validationOptions) {
    return ValidateBy({
        name: MAX_LENGTH,
        constraints: [max],
        validator: {
            validate: (value, args) => maxLength(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be shorter than or equal to $constraint1 characters", validationOptions)
        }
    }, validationOptions);
}

const MIN_LENGTH = "minLength";
/**
 * Checks if the string's length is not less than given number. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
function minLength(value, min) {
    return typeof value === "string" && validator.isLength(value, { min });
}
/**
 * Checks if the string's length is not less than given number. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
function MinLength(min, validationOptions) {
    return ValidateBy({
        name: MIN_LENGTH,
        constraints: [min],
        validator: {
            validate: (value, args) => minLength(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be longer than or equal to $constraint1 characters", validationOptions)
        }
    }, validationOptions);
}

const MATCHES = "matches";
function matches(value, pattern, modifiers) {
    return typeof value === "string" && validator.matches(value, pattern, modifiers);
}
function Matches(pattern, modifiersOrAnnotationOptions, validationOptions) {
    let modifiers;
    if (modifiersOrAnnotationOptions && modifiersOrAnnotationOptions instanceof Object && !validationOptions) {
        validationOptions = modifiersOrAnnotationOptions;
    }
    else {
        modifiers = modifiersOrAnnotationOptions;
    }
    return ValidateBy({
        name: MATCHES,
        constraints: [pattern, modifiers],
        validator: {
            validate: (value, args) => matches(value, args.constraints[0], args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix, args) => eachPrefix + "$property must match $constraint1 regular expression", validationOptions)
        }
    }, validationOptions);
}

const IS_PHONE_NUMBER = "isPhoneNumber";
/**
 * Checks if the string is a valid phone number.
 * @param value the potential phone number string to test
 * @param {string} region 2 characters uppercase country code (e.g. DE, US, CH).
 * If users must enter the intl. prefix (e.g. +41), then you may pass "ZZ" or null as region.
 * See [google-libphonenumber, metadata.js:countryCodeToRegionCodeMap on github]{@link https://github.com/ruimarinho/google-libphonenumber/blob/1e46138878cff479aafe2ce62175c6c49cb58720/src/metadata.js#L33}
 */
function isPhoneNumber(value, region) {
    const phoneUtil = PhoneNumberUtil.getInstance();
    try {
        const phoneNum = phoneUtil.parseAndKeepRawInput(value, region);
        const result = phoneUtil.isValidNumber(phoneNum);
        return result;
    }
    catch (error) {
        // logging?
        return false;
    }
}
/**
 * Checks if the string is a valid phone number.
 * @param region 2 characters uppercase country code (e.g. DE, US, CH).
 * If users must enter the intl. prefix (e.g. +41), then you may pass "ZZ" or null as region.
 * See [google-libphonenumber, metadata.js:countryCodeToRegionCodeMap on github]{@link https://github.com/ruimarinho/google-libphonenumber/blob/1e46138878cff479aafe2ce62175c6c49cb58720/src/metadata.js#L33}
 */
function IsPhoneNumber(region, validationOptions) {
    return ValidateBy({
        name: IS_PHONE_NUMBER,
        constraints: [region],
        validator: {
            validate: (value, args) => isPhoneNumber(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a valid phone number", validationOptions),
        }
    }, validationOptions);
}

const IS_MILITARY_TIME = "isMilitaryTime";
/**
 * Checks if the string represents a time without a given timezone in the format HH:MM (military)
 * If the given value does not match the pattern HH:MM, then it returns false.
 */
function isMilitaryTime(value) {
    const militaryTimeRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
    return typeof value === "string" && validator.matches(value, militaryTimeRegex);
}
/**
 * Checks if the string represents a time without a given timezone in the format HH:MM (military)
 * If the given value does not match the pattern HH:MM, then it returns false.
 */
function IsMilitaryTime(validationOptions) {
    return ValidateBy({
        name: IS_MILITARY_TIME,
        validator: {
            validate: (value, args) => isMilitaryTime(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a valid representation of military time in the format HH:MM", validationOptions)
        }
    }, validationOptions);
}

const IS_HASH = "isHash";
/**
 * Check if the string is a hash of type algorithm.
 * Algorithm is one of ['md4', 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd128', 'ripemd160', 'tiger128',
 * 'tiger160', 'tiger192', 'crc32', 'crc32b']
 */
function isHash(value, algorithm) {
    return typeof value === "string" && validator.isHash(value, algorithm);
}
/**
 * Check if the string is a hash of type algorithm.
 * Algorithm is one of ['md4', 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd128', 'ripemd160', 'tiger128',
 * 'tiger160', 'tiger192', 'crc32', 'crc32b']
 */
function IsHash(algorithm, validationOptions) {
    return ValidateBy({
        name: IS_HASH,
        constraints: [algorithm],
        validator: {
            validate: (value, args) => isHash(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a hash of type $constraint1", validationOptions)
        }
    }, validationOptions);
}

const IS_ISSN = "isISSN";
/**
 * Checks if the string is a ISSN.
 * If given value is not a string, then it returns false.
 */
function isISSN(value, options) {
    return typeof value === "string" && validator.isISSN(value, options);
}
/**
 * Checks if the string is a ISSN.
 * If given value is not a string, then it returns false.
 */
function IsISSN(options, validationOptions) {
    return ValidateBy({
        name: IS_ISSN,
        constraints: [options],
        validator: {
            validate: (value, args) => isISSN(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a ISSN", validationOptions)
        }
    }, validationOptions);
}

const IS_DATE_STRING = "isDateString";
/**
 * Checks if a given value is a ISOString date.
 */
function isDateString(value) {
    const regex = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[\+\-][0-2]\d(?:\:[0-5]\d)?)?$/g;
    return typeof value === "string" && regex.test(value);
}
/**
 * Checks if a given value is a ISOString date.
 */
function IsDateString(validationOptions) {
    return ValidateBy({
        name: IS_DATE_STRING,
        validator: {
            validate: (value, args) => isDateString(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a ISOString", validationOptions)
        }
    }, validationOptions);
}

const IS_BOOLEAN_STRING = "isBooleanString";
/**
 * Checks if a string is a boolean.
 * If given value is not a string, then it returns false.
 */
function isBooleanString(value) {
    return typeof value === "string" && validator.isBoolean(value);
}
/**
 * Checks if a string is a boolean.
 * If given value is not a string, then it returns false.
 */
function IsBooleanString(validationOptions) {
    return ValidateBy({
        name: IS_BOOLEAN_STRING,
        validator: {
            validate: (value, args) => isBooleanString(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a boolean string", validationOptions)
        }
    }, validationOptions);
}

const IS_NUMBER_STRING = "isNumberString";
/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
function isNumberString(value, options) {
    return typeof value === "string" && validator.isNumeric(value, options);
}
/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
function IsNumberString(options, validationOptions) {
    return ValidateBy({
        name: IS_NUMBER_STRING,
        constraints: [options],
        validator: {
            validate: (value, args) => isNumberString(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a number string", validationOptions)
        }
    }, validationOptions);
}

const IS_BASE32 = "isBase32";
/**
 * Checks if a string is base32 encoded.
 * If given value is not a string, then it returns false.
 */
function isBase32(value) {
    return typeof value === "string" && validator.isBase32(value);
}
/**
 * Check if a string is base32 encoded.
 * If given value is not a string, then it returns false.
 */
function IsBase32(validationOptions) {
    return ValidateBy({
        name: IS_BASE32,
        validator: {
            validate: (value, args) => isBase32(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be base32 encoded", validationOptions)
        }
    }, validationOptions);
}

const IS_BIC = "isBIC";
/**
 * Check if a string is a BIC (Bank Identification Code) or SWIFT code.
 * If given value is not a string, then it returns false.
 */
function isBIC(value) {
    return typeof value === "string" && validator.isBIC(value);
}
/**
 * Check if a string is a BIC (Bank Identification Code) or SWIFT code.
 * If given value is not a string, then it returns false.
 */
function IsBIC(validationOptions) {
    return ValidateBy({
        name: IS_BIC,
        validator: {
            validate: (value, args) => isBIC(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a BIC or SWIFT code", validationOptions)
        }
    }, validationOptions);
}

const IS_BTC_ADDRESS = "isBtcAddress";
/**
 * Check if the string is a valid BTC address.
 * If given value is not a string, then it returns false.
 */
function isBtcAddress(value) {
    return typeof value === "string" && validator.isBtcAddress(value);
}
/**
 * Check if the string is a valid BTC address.
 * If given value is not a string, then it returns false.
 */
function IsBtcAddress(validationOptions) {
    return ValidateBy({
        name: IS_BTC_ADDRESS,
        validator: {
            validate: (value, args) => isBtcAddress(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a BTC address", validationOptions)
        }
    }, validationOptions);
}

const IS_DATA_URI = "isDataURI";
/**
 * Check if the string is a data uri format.
 * If given value is not a string, then it returns false.
 */
function isDataURI(value) {
    return typeof value === "string" && validator.isDataURI(value);
}
/**
 * Check if the string is a data uri format.
 * If given value is not a string, then it returns false.
 */
function IsDataURI(validationOptions) {
    return ValidateBy({
        name: IS_DATA_URI,
        validator: {
            validate: (value, args) => isDataURI(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a data uri format", validationOptions)
        }
    }, validationOptions);
}

const IS_EAN = "isEAN";
/**
 * Check if the string is an EAN (European Article Number).
 * If given value is not a string, then it returns false.
 */
function isEAN(value) {
    return typeof value === "string" && validator.isEAN(value);
}
/**
 * Check if the string is an EAN (European Article Number).
 * If given value is not a string, then it returns false.
 */
function IsEAN(validationOptions) {
    return ValidateBy({
        name: IS_EAN,
        validator: {
            validate: (value, args) => isEAN(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an EAN (European Article Number)", validationOptions)
        }
    }, validationOptions);
}

const IS_ETHEREUM_ADDRESS = "isEthereumAddress";
/**
 * Check if the string is an Ethereum address using basic regex. Does not validate address checksums.
 * If given value is not a string, then it returns false.
 */
function isEthereumAddress(value) {
    return typeof value === "string" && validator.isEthereumAddress(value);
}
/**
 * Check if the string is an Ethereum address using basic regex. Does not validate address checksums.
 * If given value is not a string, then it returns false.
 */
function IsEthereumAddress(validationOptions) {
    return ValidateBy({
        name: IS_ETHEREUM_ADDRESS,
        validator: {
            validate: (value, args) => isEthereumAddress(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an Ethereum address", validationOptions)
        }
    }, validationOptions);
}

const IS_HSL = "isHSL";
/**
* Check if the string is an HSL (hue, saturation, lightness, optional alpha) color based on CSS Colors Level 4 specification.
 * Comma-separated format supported. Space-separated format supported with the exception of a few edge cases (ex: hsl(200grad+.1%62%/1)).
 * If given value is not a string, then it returns false.
 */
function isHSL(value) {
    return typeof value === "string" && validator.isHSL(value);
}
/**
 * Check if the string is an HSL (hue, saturation, lightness, optional alpha) color based on CSS Colors Level 4 specification.
 * Comma-separated format supported. Space-separated format supported with the exception of a few edge cases (ex: hsl(200grad+.1%62%/1)).
 * If given value is not a string, then it returns false.
 */
function IsHSL(validationOptions) {
    return ValidateBy({
        name: IS_HSL,
        validator: {
            validate: (value, args) => isHSL(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a HSL color", validationOptions)
        }
    }, validationOptions);
}

const IS_IBAN = "isIBAN";
/**
 * Check if a string is a IBAN (International Bank Account Number).
 * If given value is not a string, then it returns false.
 */
function isIBAN(value) {
    return typeof value === "string" && validator.isIBAN(value);
}
/**
 * Check if a string is a IBAN (International Bank Account Number).
 * If given value is not a string, then it returns false.
 */
function IsIBAN(validationOptions) {
    return ValidateBy({
        name: IS_IBAN,
        validator: {
            validate: (value, args) => isIBAN(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an IBAN", validationOptions)
        }
    }, validationOptions);
}

const IS_IDENTITY_CARD = "isIdentityCard";
/**
 * Check if the string is a valid identity card code.
 * locale is one of ['ES', 'zh-TW', 'he-IL', 'ar-TN'] OR 'any'. If 'any' is used, function will check if any of the locals match.
 * Defaults to 'any'.
 * If given value is not a string, then it returns false.
 */
function isIdentityCard(value, locale) {
    return typeof value === "string" && validator.isIdentityCard(value, locale);
}
/**
 * Check if the string is a valid identity card code.
 * locale is one of ['ES', 'zh-TW', 'he-IL', 'ar-TN'] OR 'any'. If 'any' is used, function will check if any of the locals match.
 * Defaults to 'any'.
 * If given value is not a string, then it returns false.
 */
function IsIdentityCard(locale, validationOptions) {
    return ValidateBy({
        name: IS_IDENTITY_CARD,
        constraints: [locale],
        validator: {
            validate: (value, args) => isIdentityCard(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a identity card number", validationOptions)
        }
    }, validationOptions);
}

const IS_ISRC = "isISRC";
/**
 * Check if the string is a ISRC.
 * If given value is not a string, then it returns false.
 */
function isISRC(value) {
    return typeof value === "string" && validator.isISRC(value);
}
/**
 * Check if the string is a ISRC.
 * If given value is not a string, then it returns false.
 */
function IsISRC(validationOptions) {
    return ValidateBy({
        name: IS_ISRC,
        validator: {
            validate: (value, args) => isISRC(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an ISRC", validationOptions)
        }
    }, validationOptions);
}

const IS_LOCALE = "isLocale";
/**
 * Check if the string is a locale.
 * If given value is not a string, then it returns false.
 */
function isLocale(value) {
    return typeof value === "string" && validator.isLocale(value);
}
/**
 * Check if the string is a locale.
 * If given value is not a string, then it returns false.
 */
function IsLocale(validationOptions) {
    return ValidateBy({
        name: IS_LOCALE,
        validator: {
            validate: (value, args) => isLocale(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be locale", validationOptions)
        }
    }, validationOptions);
}

const IS_MAGNET_URI = "isMagnetURI";
/**
 * Check if the string is a magnet uri format.
 * If given value is not a string, then it returns false.
 */
function isMagnetURI(value) {
    return typeof value === "string" && validator.isMagnetURI(value);
}
/**
 * Check if the string is a magnet uri format.
 * If given value is not a string, then it returns false.
 */
function IsMagnetURI(validationOptions) {
    return ValidateBy({
        name: IS_MAGNET_URI,
        validator: {
            validate: (value, args) => isMagnetURI(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be magnet uri format", validationOptions)
        }
    }, validationOptions);
}

const IS_MIME_TYPE = "isMimeType";
/**
 * Check if the string matches to a valid MIME type format
 * If given value is not a string, then it returns false.
 */
function isMimeType(value) {
    return typeof value === "string" && validator.isMimeType(value);
}
/**
 * Check if the string matches to a valid MIME type format
 * If given value is not a string, then it returns false.
 */
function IsMimeType(validationOptions) {
    return ValidateBy({
        name: IS_MIME_TYPE,
        validator: {
            validate: (value, args) => isMimeType(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be MIME type format", validationOptions)
        }
    }, validationOptions);
}

const IS_OCTAL = "isOctal";
/**
 * Check if the string is a valid octal number.
 * If given value is not a string, then it returns false.
 */
function isOctal(value) {
    return typeof value === "string" && validator.isOctal(value);
}
/**
 * Check if the string is a valid octal number.
 * If given value is not a string, then it returns false.
 */
function IsOctal(validationOptions) {
    return ValidateBy({
        name: IS_OCTAL,
        validator: {
            validate: (value, args) => isOctal(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be valid octal number", validationOptions)
        }
    }, validationOptions);
}

const IS_PASSPORT_NUMBER = "isPassportNumber";
/**
 * Check if the string is a valid passport number relative to a specific country code.
 * If given value is not a string, then it returns false.
 */
function isPassportNumber(value, countryCode) {
    return typeof value === "string" && validator.isPassportNumber(value, countryCode);
}
/**
 * Check if the string is a valid passport number relative to a specific country code.
 * If given value is not a string, then it returns false.
 */
function IsPassportNumber(countryCode, validationOptions) {
    return ValidateBy({
        name: IS_PASSPORT_NUMBER,
        constraints: [countryCode],
        validator: {
            validate: (value, args) => isPassportNumber(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be valid passport number", validationOptions)
        }
    }, validationOptions);
}

const IS_POSTAL_CODE = "isPostalCode";
/**
 * Check if the string is a postal code,
 * (locale is one of [ 'AD', 'AT', 'AU', 'BE', 'BG', 'BR', 'CA', 'CH', 'CZ', 'DE', 'DK', 'DZ', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'ID', 'IE' 'IL', 'IN', 'IR', 'IS', 'IT', 'JP', 'KE', 'LI', 'LT', 'LU', 'LV', 'MT', 'MX', 'NL', 'NO', 'NZ', 'PL', 'PR', 'PT', 'RO', 'RU', 'SA', 'SE', 'SI', 'TN', 'TW', 'UA', 'US', 'ZA', 'ZM' ] OR 'any'. If 'any' is used, function will check if any of the locals match. Locale list is validator.isPostalCodeLocales.).
 * If given value is not a string, then it returns false.
 */
function isPostalCode(value, locale) {
    return typeof value === "string" && validator.isPostalCode(value, locale);
}
/**
 * Check if the string is a postal code,
 * (locale is one of [ 'AD', 'AT', 'AU', 'BE', 'BG', 'BR', 'CA', 'CH', 'CZ', 'DE', 'DK', 'DZ', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'ID', 'IE' 'IL', 'IN', 'IR', 'IS', 'IT', 'JP', 'KE', 'LI', 'LT', 'LU', 'LV', 'MT', 'MX', 'NL', 'NO', 'NZ', 'PL', 'PR', 'PT', 'RO', 'RU', 'SA', 'SE', 'SI', 'TN', 'TW', 'UA', 'US', 'ZA', 'ZM' ] OR 'any'. If 'any' is used, function will check if any of the locals match. Locale list is validator.isPostalCodeLocales.).
 * If given value is not a string, then it returns false.
 */
function IsPostalCode(locale, validationOptions) {
    return ValidateBy({
        name: IS_POSTAL_CODE,
        constraints: [locale],
        validator: {
            validate: (value, args) => isPostalCode(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a postal code", validationOptions)
        }
    }, validationOptions);
}

const IS_RFC_3339 = "isRFC3339";
/**
 * Check if the string is a valid RFC 3339 date.
 * If given value is not a string, then it returns false.
 */
function isRFC3339(value) {
    return typeof value === "string" && validator.isRFC3339(value);
}
/**
 * Check if the string is a valid RFC 3339 date.
 * If given value is not a string, then it returns false.
 */
function IsRFC3339(validationOptions) {
    return ValidateBy({
        name: IS_RFC_3339,
        validator: {
            validate: (value, args) => isRFC3339(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be RFC 3339 date", validationOptions)
        }
    }, validationOptions);
}

const IS_RGB_COLOR = "isRgbColor";
/**
* Check if the string is a rgb or rgba color.
 * `includePercentValues` defaults to true. If you don't want to allow to set rgb or rgba values with percents, like rgb(5%,5%,5%), or rgba(90%,90%,90%,.3), then set it to false.
 * If given value is not a string, then it returns false.
 */
function isRgbColor(value, includePercentValues) {
    return typeof value === "string" && validator.isRgbColor(value, includePercentValues);
}
/**
 * Check if the string is a rgb or rgba color.
 * `includePercentValues` defaults to true. If you don't want to allow to set rgb or rgba values with percents, like rgb(5%,5%,5%), or rgba(90%,90%,90%,.3), then set it to false.
 * If given value is not a string, then it returns false.
 */
function IsRgbColor(includePercentValues, validationOptions) {
    return ValidateBy({
        name: IS_RGB_COLOR,
        constraints: [includePercentValues],
        validator: {
            validate: (value, args) => isRgbColor(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be RGB color", validationOptions)
        }
    }, validationOptions);
}

const IS_SEM_VER = "isSemVer";
/**
 * Check if the string is a Semantic Versioning Specification (SemVer).
 * If given value is not a string, then it returns false.
 */
function isSemVer(value) {
    return typeof value === "string" && validator.isSemVer(value);
}
/**
 * Check if the string is a Semantic Versioning Specification (SemVer).
 * If given value is not a string, then it returns false.
 */
function IsSemVer(validationOptions) {
    return ValidateBy({
        name: IS_SEM_VER,
        validator: {
            validate: (value, args) => isSemVer(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a Semantic Versioning Specification", validationOptions)
        }
    }, validationOptions);
}

const IS_BOOLEAN = "isBoolean";
/**
 * Checks if a given value is a number.
 */
function isBoolean(value) {
    return value instanceof Boolean || typeof value === "boolean";
}
/**
 * Checks if a value is a number.
 */
function IsBoolean(validationOptions) {
    return ValidateBy({
        name: IS_BOOLEAN,
        validator: {
            validate: (value, args) => isBoolean(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a boolean value", validationOptions)
        }
    }, validationOptions);
}

const IS_DATE = "isDate";
/**
 * Checks if a given value is a number.
 */
function isDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
/**
 * Checks if a value is a number.
 */
function IsDate(validationOptions) {
    return ValidateBy({
        name: IS_DATE,
        validator: {
            validate: (value, args) => isDate(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a Date instance", validationOptions)
        }
    }, validationOptions);
}

const IS_NUMBER = "isNumber";
/**
 * Checks if a given value is a number.
 */
function isNumber(value, options = {}) {
    if (typeof value !== "number") {
        return false;
    }
    if (value === Infinity || value === -Infinity) {
        return options.allowInfinity;
    }
    if (Number.isNaN(value)) {
        return options.allowNaN;
    }
    if (options.maxDecimalPlaces !== undefined) {
        let decimalPlaces = 0;
        if ((value % 1) !== 0) {
            decimalPlaces = value.toString().split(".")[1].length;
        }
        if (decimalPlaces > options.maxDecimalPlaces) {
            return false;
        }
    }
    return Number.isFinite(value);
}
/**
 * Checks if a value is a number.
 */
function IsNumber(options = {}, validationOptions) {
    return ValidateBy({
        name: IS_NUMBER,
        constraints: [options],
        validator: {
            validate: (value, args) => isNumber(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a number conforming to the specified constraints", validationOptions)
        }
    }, validationOptions);
}

const IS_ENUM = "isEnum";
/**
 * Checks if a given value is an enum
 */
function isEnum(value, entity) {
    const enumValues = Object.keys(entity)
        .map(k => entity[k]);
    return enumValues.indexOf(value) >= 0;
}
/**
 * Checks if a given value is an enum
 */
function IsEnum(entity, validationOptions) {
    return ValidateBy({
        name: IS_ENUM,
        constraints: [entity],
        validator: {
            validate: (value, args) => isEnum(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a valid enum value", validationOptions)
        }
    }, validationOptions);
}

const IS_INT = "isInt";
/**
 * Checks if value is an integer.
 */
function isInt(val) {
    return typeof val === "number" && Number.isInteger(val);
}
/**
 * Checks if value is an integer.
 */
function IsInt(validationOptions) {
    return ValidateBy({
        name: IS_INT,
        validator: {
            validate: (value, args) => isInt(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an integer number", validationOptions)
        }
    }, validationOptions);
}

const IS_STRING = "isString";
/**
* Checks if a given value is a real string.
*/
function isString(value) {
    return value instanceof String || typeof value === "string";
}
/**
* Checks if a given value is a real string.
*/
function IsString(validationOptions) {
    return ValidateBy({
        name: IS_STRING,
        validator: {
            validate: (value, args) => isString(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a string", validationOptions)
        }
    }, validationOptions);
}

const IS_ARRAY = "isArray";
/**
 * Checks if a given value is an array
 */
function isArray(value) {
    return value instanceof Array;
}
/**
 * Checks if a given value is an array
 */
function IsArray(validationOptions) {
    return ValidateBy({
        name: IS_ARRAY,
        validator: {
            validate: (value, args) => isArray(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an array", validationOptions)
        }
    }, validationOptions);
}

const IS_OBJECT = "isObject";
/**
 * Checks if the value is valid Object.
 * Returns false if the value is not an object.
 */
function isObject(value) {
    return value != null && (typeof value === "object" || typeof value === "function") && !Array.isArray(value);
}
/**
 * Checks if the value is valid Object.
 * Returns false if the value is not an object.
 */
function IsObject(validationOptions) {
    return ValidateBy({
        name: IS_OBJECT,
        validator: {
            validate: (value, args) => isObject(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an object", validationOptions)
        }
    }, validationOptions);
}

const ARRAY_CONTAINS = "arrayContains";
/**
 * Checks if array contains all values from the given array of values.
 * If null or undefined is given then this function returns false.
 */
function arrayContains(array, values) {
    if (!(array instanceof Array))
        return false;
    return values.every(value => array.indexOf(value) !== -1);
}
/**
 * Checks if array contains all values from the given array of values.
 * If null or undefined is given then this function returns false.
 */
function ArrayContains(values, validationOptions) {
    return ValidateBy({
        name: ARRAY_CONTAINS,
        constraints: [values],
        validator: {
            validate: (value, args) => arrayContains(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain $constraint1 values", validationOptions)
        }
    }, validationOptions);
}

const ARRAY_NOT_CONTAINS = "arrayNotContains";
/**
 * Checks if array does not contain any of the given values.
 * If null or undefined is given then this function returns false.
 */
function arrayNotContains(array, values) {
    if (!(array instanceof Array))
        return false;
    return values.every(value => array.indexOf(value) === -1);
}
/**
 * Checks if array does not contain any of the given values.
 * If null or undefined is given then this function returns false.
 */
function ArrayNotContains(values, validationOptions) {
    return ValidateBy({
        name: ARRAY_NOT_CONTAINS,
        constraints: [values],
        validator: {
            validate: (value, args) => arrayNotContains(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property should not contain $constraint1 values", validationOptions)
        }
    }, validationOptions);
}

const ARRAY_NOT_EMPTY = "arrayNotEmpty";
/**
 * Checks if given array is not empty.
 * If null or undefined is given then this function returns false.
 */
function arrayNotEmpty(array) {
    return array instanceof Array && array.length > 0;
}
/**
 * Checks if given array is not empty.
 * If null or undefined is given then this function returns false.
 */
function ArrayNotEmpty(validationOptions) {
    return ValidateBy({
        name: ARRAY_NOT_EMPTY,
        validator: {
            validate: (value, args) => arrayNotEmpty(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property should not be empty", validationOptions)
        }
    }, validationOptions);
}

const ARRAY_MIN_SIZE = "arrayMinSize";
/**
 * Checks if array's length is as minimal this number.
 * If null or undefined is given then this function returns false.
 */
function arrayMinSize(array, min) {
    return array instanceof Array && array.length >= min;
}
/**
 * Checks if array's length is as minimal this number.
 * If null or undefined is given then this function returns false.
 */
function ArrayMinSize(min, validationOptions) {
    return ValidateBy({
        name: ARRAY_MIN_SIZE,
        constraints: [min],
        validator: {
            validate: (value, args) => arrayMinSize(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain at least $constraint1 elements", validationOptions)
        }
    }, validationOptions);
}

const ARRAY_MAX_SIZE = "arrayMaxSize";
/**
 * Checks if array's length is as maximal this number.
 * If null or undefined is given then this function returns false.
 */
function arrayMaxSize(array, max) {
    return array instanceof Array && array.length <= max;
}
/**
 * Checks if array's length is as maximal this number.
 * If null or undefined is given then this function returns false.
 */
function ArrayMaxSize(max, validationOptions) {
    return ValidateBy({
        name: ARRAY_MAX_SIZE,
        constraints: [max],
        validator: {
            validate: (value, args) => arrayMaxSize(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must contain not more than $constraint1 elements", validationOptions)
        }
    }, validationOptions);
}

const ARRAY_UNIQUE = "arrayUnique";
/**
 * Checks if all array's values are unique. Comparison for objects is reference-based.
 * If null or undefined is given then this function returns false.
 */
function arrayUnique(array) {
    if (!(array instanceof Array))
        return false;
    const uniqueItems = array.filter((a, b, c) => c.indexOf(a) === b);
    return array.length === uniqueItems.length;
}
/**
 * Checks if all array's values are unique. Comparison for objects is reference-based.
 * If null or undefined is given then this function returns false.
 */
function ArrayUnique(validationOptions) {
    return ValidateBy({
        name: ARRAY_UNIQUE,
        validator: {
            validate: (value, args) => arrayUnique(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "All $property's elements must be unique", validationOptions)
        }
    }, validationOptions);
}

const IS_NOT_EMPTY_OBJECT = "isNotEmptyObject";
/**
 * Checks if the value is valid Object & not empty.
 * Returns false if the value is not an object or an empty valid object.
 */
function isNotEmptyObject(value) {
    if (!isObject(value)) {
        return false;
    }
    for (const key in value) {
        if (value.hasOwnProperty(key)) {
            return true;
        }
    }
    return false;
}
/**
 * Checks if the value is valid Object & not empty.
 * Returns false if the value is not an object or an empty valid object.
 */
function IsNotEmptyObject(validationOptions) {
    return ValidateBy({
        name: IS_NOT_EMPTY_OBJECT,
        validator: {
            validate: (value, args) => isNotEmptyObject(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a non-empty object", validationOptions)
        }
    }, validationOptions);
}

const IS_INSTANCE = "isInstance";
/**
 * Checks if the value is an instance of the specified object.
 */
function isInstance(object, targetTypeConstructor) {
    return targetTypeConstructor
        && typeof targetTypeConstructor === "function"
        && object instanceof targetTypeConstructor;
}
/**
 * Checks if the value is an instance of the specified object.
 */
function IsInstance(targetType, validationOptions) {
    return ValidateBy({
        name: IS_INSTANCE,
        constraints: [targetType],
        validator: {
            validate: (value, args) => isInstance(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix, args) => {
                if (args.constraints[0]) {
                    return eachPrefix + `$property must be an instance of ${args.constraints[0].name}`;
                }
                else {
                    return eachPrefix + `${IS_INSTANCE} decorator expects and object as value, but got falsy value.`;
                }
            }, validationOptions)
        }
    }, validationOptions);
}

/**
 * Validates given object by object's decorators or given validation schema.
 */
function validate(schemaNameOrObject, objectOrValidationOptions, maybeValidatorOptions) {
    if (typeof schemaNameOrObject === "string") {
        return getFromContainer(Validator).validate(schemaNameOrObject, objectOrValidationOptions, maybeValidatorOptions);
    }
    else {
        return getFromContainer(Validator).validate(schemaNameOrObject, objectOrValidationOptions);
    }
}
/**
 * Validates given object by object's decorators or given validation schema and reject on error.
 */
function validateOrReject(schemaNameOrObject, objectOrValidationOptions, maybeValidatorOptions) {
    if (typeof schemaNameOrObject === "string") {
        return getFromContainer(Validator).validateOrReject(schemaNameOrObject, objectOrValidationOptions, maybeValidatorOptions);
    }
    else {
        return getFromContainer(Validator).validateOrReject(schemaNameOrObject, objectOrValidationOptions);
    }
}
/**
 * Validates given object by object's decorators or given validation schema.
 * Note that this method completely ignores async validations.
 * If you want to properly perform validation you need to call validate method instead.
 */
function validateSync(schemaNameOrObject, objectOrValidationOptions, maybeValidatorOptions) {
    if (typeof schemaNameOrObject === "string") {
        return getFromContainer(Validator).validateSync(schemaNameOrObject, objectOrValidationOptions, maybeValidatorOptions);
    }
    else {
        return getFromContainer(Validator).validateSync(schemaNameOrObject, objectOrValidationOptions);
    }
}
/**
 * Registers a new validation schema.
 */
function registerSchema(schema) {
    getMetadataStorage().addValidationSchema(schema);
}

export { ARRAY_CONTAINS, ARRAY_MAX_SIZE, ARRAY_MIN_SIZE, ARRAY_NOT_CONTAINS, ARRAY_NOT_EMPTY, ARRAY_UNIQUE, Allow, ArrayContains, ArrayMaxSize, ArrayMinSize, ArrayNotContains, ArrayNotEmpty, ArrayUnique, CONTAINS, Contains, EQUALS, Equals, IS_ALPHA, IS_ALPHANUMERIC, IS_ARRAY, IS_ASCII, IS_BASE32, IS_BASE64, IS_BIC, IS_BOOLEAN, IS_BOOLEAN_STRING, IS_BTC_ADDRESS, IS_BYTE_LENGTH, IS_CREDIT_CARD, IS_CURRENCY, IS_DATA_URI, IS_DATE, IS_DATE_STRING, IS_DECIMAL, IS_DEFINED, IS_DIVISIBLE_BY, IS_EAN, IS_EMAIL, IS_EMPTY, IS_ENUM, IS_ETHEREUM_ADDRESS, IS_FIREBASE_PUSH_ID, IS_FQDN, IS_FULL_WIDTH, IS_HALF_WIDTH, IS_HASH, IS_HEXADECIMAL, IS_HEX_COLOR, IS_HSL, IS_IBAN, IS_IDENTITY_CARD, IS_IN, IS_INSTANCE, IS_INT, IS_IP, IS_ISBN, IS_ISIN, IS_ISO31661_ALPHA_2, IS_ISO31661_ALPHA_3, IS_ISO8601, IS_ISRC, IS_ISSN, IS_JSON, IS_JWT, IS_LATITUDE, IS_LATLONG, IS_LOCALE, IS_LONGITUDE, IS_LOWERCASE, IS_MAC_ADDRESS, IS_MAGNET_URI, IS_MILITARY_TIME, IS_MIME_TYPE, IS_MOBILE_PHONE, IS_MONGO_ID, IS_MULTIBYTE, IS_NEGATIVE, IS_NOT_EMPTY, IS_NOT_EMPTY_OBJECT, IS_NOT_IN, IS_NUMBER, IS_NUMBER_STRING, IS_OBJECT, IS_OCTAL, IS_PASSPORT_NUMBER, IS_PHONE_NUMBER, IS_PORT, IS_POSITIVE, IS_POSTAL_CODE, IS_RFC_3339, IS_RGB_COLOR, IS_SEM_VER, IS_STRING, IS_SURROGATE_PAIR, IS_UPPERCASE, IS_URL, IS_UUID, IS_VARIABLE_WIDTH, IsAlpha, IsAlphanumeric, IsArray, IsAscii, IsBIC, IsBase32, IsBase64, IsBoolean, IsBooleanString, IsBtcAddress, IsByteLength, IsCreditCard, IsCurrency, IsDataURI, IsDate, IsDateString, IsDecimal, IsDefined, IsDivisibleBy, IsEAN, IsEmail, IsEmpty, IsEnum, IsEthereumAddress, IsFQDN, IsFirebasePushId, IsFullWidth, IsHSL, IsHalfWidth, IsHash, IsHexColor, IsHexadecimal, IsIBAN, IsIP, IsISBN, IsISIN, IsISO31661Alpha2, IsISO31661Alpha3, IsISO8601, IsISRC, IsISSN, IsIdentityCard, IsIn, IsInstance, IsInt, IsJSON, IsJWT, IsLatLong, IsLatitude, IsLocale, IsLongitude, IsLowercase, IsMACAddress, IsMagnetURI, IsMilitaryTime, IsMimeType, IsMobilePhone, IsMongoId, IsMultibyte, IsNegative, IsNotEmpty, IsNotEmptyObject, IsNotIn, IsNumber, IsNumberString, IsObject, IsOctal, IsOptional, IsPassportNumber, IsPhoneNumber, IsPort, IsPositive, IsPostalCode, IsRFC3339, IsRgbColor, IsSemVer, IsString, IsSurrogatePair, IsUUID, IsUppercase, IsUrl, IsVariableWidth, LENGTH, Length, MATCHES, MAX, MAX_DATE, MAX_LENGTH, MIN, MIN_DATE, MIN_LENGTH, Matches, Max, MaxDate, MaxLength, MetadataStorage, Min, MinDate, MinLength, NOT_CONTAINS, NOT_EQUALS, NotContains, NotEquals, Validate, ValidateBy, ValidateIf, ValidateNested, ValidatePromise, ValidationError, ValidationTypes, Validator, ValidatorConstraint, arrayContains, arrayMaxSize, arrayMinSize, arrayNotContains, arrayNotEmpty, arrayUnique, buildMessage, contains, equals, getFromContainer, getMetadataStorage, isAlpha, isAlphanumeric, isArray, isAscii, isBIC, isBase32, isBase64, isBoolean, isBooleanString, isBtcAddress, isByteLength, isCreditCard, isCurrency, isDataURI, isDate, isDateString, isDecimal, isDefined, isDivisibleBy, isEAN, isEmail, isEmpty, isEnum, isEthereumAddress, isFQDN, isFirebasePushId, isFullWidth, isHSL, isHalfWidth, isHash, isHexColor, isHexadecimal, isIBAN, isIP, isISBN, isISIN, isISO31661Alpha2, isISO31661Alpha3, isISO8601, isISRC, isISSN, isIdentityCard, isIn, isInstance, isInt, isJSON, isJWT, isLatLong, isLatitude, isLocale, isLongitude, isLowercase, isMACAddress, isMagnetURI, isMilitaryTime, isMimeType, isMobilePhone, isMongoId, isMultibyte, isNegative, isNotEmpty, isNotEmptyObject, isNotIn, isNumber, isNumberString, isObject, isOctal, isPassportNumber, isPhoneNumber, isPort, isPositive, isPostalCode, isRFC3339, isRgbColor, isSemVer, isString, isSurrogatePair, isURL, isUUID, isUppercase, isValidationOptions, isVariableWidth, length, matches, max, maxDate, maxLength, min, minDate, minLength, notContains, notEquals, registerDecorator, registerSchema, useContainer, validate, validateOrReject, validateSync };
//# sourceMappingURL=index.esm.js.map
