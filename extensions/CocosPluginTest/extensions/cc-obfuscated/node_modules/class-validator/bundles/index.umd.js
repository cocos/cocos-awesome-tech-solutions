(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('tslib'), require('validator'), require('google-libphonenumber')) :
    typeof define === 'function' && define.amd ? define(['exports', 'tslib', 'validator', 'google-libphonenumber'], factory) :
    (global = global || self, factory(global.ClassValidator = {}, global.tslib_1, global.validator, global.googleLibphonenumber));
}(this, (function (exports, tslib_1, validator, googleLibphonenumber) { 'use strict';

    validator = validator && Object.prototype.hasOwnProperty.call(validator, 'default') ? validator['default'] : validator;

    /**
     * This metadata contains validation rules.
     */
    var ValidationMetadata = /** @class */ (function () {
        // -------------------------------------------------------------------------
        // Constructor
        // -------------------------------------------------------------------------
        function ValidationMetadata(args) {
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
        return ValidationMetadata;
    }());

    /**
     * Used to transform validation schemas to validation metadatas.
     */
    var ValidationSchemaToMetadataTransformer = /** @class */ (function () {
        function ValidationSchemaToMetadataTransformer() {
        }
        ValidationSchemaToMetadataTransformer.prototype.transform = function (schema) {
            var metadatas = [];
            Object.keys(schema.properties).forEach(function (property) {
                schema.properties[property].forEach(function (validation) {
                    var validationOptions = {
                        message: validation.message,
                        groups: validation.groups,
                        always: validation.always,
                        each: validation.each
                    };
                    var args = {
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
        };
        return ValidationSchemaToMetadataTransformer;
    }());

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
    var MetadataStorage = /** @class */ (function () {
        function MetadataStorage() {
            // -------------------------------------------------------------------------
            // Private properties
            // -------------------------------------------------------------------------
            this.validationMetadatas = [];
            this.constraintMetadatas = [];
        }
        Object.defineProperty(MetadataStorage.prototype, "hasValidationMetaData", {
            get: function () {
                return !!this.validationMetadatas.length;
            },
            enumerable: true,
            configurable: true
        });
        // -------------------------------------------------------------------------
        // Public Methods
        // -------------------------------------------------------------------------
        /**
         * Adds a new validation metadata.
         */
        MetadataStorage.prototype.addValidationSchema = function (schema) {
            var _this = this;
            var validationMetadatas = new ValidationSchemaToMetadataTransformer().transform(schema);
            validationMetadatas.forEach(function (validationMetadata) { return _this.addValidationMetadata(validationMetadata); });
        };
        /**
         * Adds a new validation metadata.
         */
        MetadataStorage.prototype.addValidationMetadata = function (metadata) {
            this.validationMetadatas.push(metadata);
        };
        /**
         * Adds a new constraint metadata.
         */
        MetadataStorage.prototype.addConstraintMetadata = function (metadata) {
            this.constraintMetadatas.push(metadata);
        };
        /**
         * Groups metadata by their property names.
         */
        MetadataStorage.prototype.groupByPropertyName = function (metadata) {
            var grouped = {};
            metadata.forEach(function (metadata) {
                if (!grouped[metadata.propertyName])
                    grouped[metadata.propertyName] = [];
                grouped[metadata.propertyName].push(metadata);
            });
            return grouped;
        };
        /**
         * Gets all validation metadatas for the given object with the given groups.
         */
        MetadataStorage.prototype.getTargetValidationMetadatas = function (targetConstructor, targetSchema, groups) {
            // get directly related to a target metadatas
            var originalMetadatas = this.validationMetadatas.filter(function (metadata) {
                if (metadata.target !== targetConstructor && metadata.target !== targetSchema)
                    return false;
                if (metadata.always)
                    return true;
                if (groups && groups.length > 0)
                    return metadata.groups && !!metadata.groups.find(function (group) { return groups.indexOf(group) !== -1; });
                return true;
            });
            // get metadatas for inherited classes
            var inheritedMetadatas = this.validationMetadatas.filter(function (metadata) {
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
                    return metadata.groups && !!metadata.groups.find(function (group) { return groups.indexOf(group) !== -1; });
                return true;
            });
            // filter out duplicate metadatas, prefer original metadatas instead of inherited metadatas
            var uniqueInheritedMetadatas = inheritedMetadatas.filter(function (inheritedMetadata) {
                return !originalMetadatas.find(function (originalMetadata) {
                    return originalMetadata.propertyName === inheritedMetadata.propertyName &&
                        originalMetadata.type === inheritedMetadata.type;
                });
            });
            return originalMetadatas.concat(uniqueInheritedMetadatas);
        };
        /**
         * Gets all validator constraints for the given object.
         */
        MetadataStorage.prototype.getTargetValidatorConstraints = function (target) {
            return this.constraintMetadatas.filter(function (metadata) { return metadata.target === target; });
        };
        return MetadataStorage;
    }());

    /**
     * Validation error description.
     */
    var ValidationError = /** @class */ (function () {
        function ValidationError() {
        }
        /**
         *
         * @param shouldDecorate decorate the message with ANSI formatter escape codes for better readability
         * @param hasParent true when the error is a child of an another one
         * @param parentPath path as string to the parent of this property
         */
        ValidationError.prototype.toString = function (shouldDecorate, hasParent, parentPath) {
            var _this = this;
            if (shouldDecorate === void 0) { shouldDecorate = false; }
            if (hasParent === void 0) { hasParent = false; }
            if (parentPath === void 0) { parentPath = ""; }
            var boldStart = shouldDecorate ? "\u001B[1m" : "";
            var boldEnd = shouldDecorate ? "\u001B[22m" : "";
            var propConstraintFailed = function (propertyName) { return " - property " + boldStart + parentPath + propertyName + boldEnd + " has failed the following constraints: " + boldStart + Object.keys(_this.constraints).join(", ") + boldEnd + " \n"; };
            if (!hasParent) {
                return "An instance of " + boldStart + (this.target ? this.target.constructor.name : "an object") + boldEnd + " has failed the validation:\n" +
                    (this.constraints ? propConstraintFailed(this.property) : "") +
                    this.children
                        .map(function (childError) { return childError.toString(shouldDecorate, true, _this.property); })
                        .join("");
            }
            else {
                // we format numbers as array indexes for better readability.
                var formattedProperty_1 = Number.isInteger(+this.property) ? "[" + this.property + "]" : "" + (parentPath ? "." : "") + this.property;
                if (this.constraints) {
                    return propConstraintFailed(formattedProperty_1);
                }
                else {
                    return this.children
                        .map(function (childError) { return childError.toString(shouldDecorate, true, "" + parentPath + formattedProperty_1); })
                        .join("");
                }
            }
        };
        return ValidationError;
    }());

    /**
     * Validation types.
     */
    var ValidationTypes = /** @class */ (function () {
        function ValidationTypes() {
        }
        /**
         * Checks if validation type is valid.
         */
        ValidationTypes.isValid = function (type) {
            var _this = this;
            return type !== "isValid" &&
                type !== "getMessage" &&
                Object.keys(this).map(function (key) { return _this[key]; }).indexOf(type) !== -1;
        };
        /* system */
        ValidationTypes.CUSTOM_VALIDATION = "customValidation"; // done
        ValidationTypes.NESTED_VALIDATION = "nestedValidation"; // done
        ValidationTypes.PROMISE_VALIDATION = "promiseValidation"; // done
        ValidationTypes.CONDITIONAL_VALIDATION = "conditionalValidation"; // done
        ValidationTypes.WHITELIST = "whitelistValidation"; // done
        ValidationTypes.IS_DEFINED = "isDefined"; // done
        return ValidationTypes;
    }());

    var ValidationUtils = /** @class */ (function () {
        function ValidationUtils() {
        }
        ValidationUtils.replaceMessageSpecialTokens = function (message, validationArguments) {
            var messageString;
            if (message instanceof Function) {
                messageString = message(validationArguments);
            }
            else if (typeof message === "string") {
                messageString = message;
            }
            if (messageString && validationArguments.constraints instanceof Array) {
                validationArguments.constraints.forEach(function (constraint, index) {
                    messageString = messageString.replace(new RegExp("\\$constraint" + (index + 1), "g"), constraint);
                });
            }
            if (messageString && validationArguments.value !== undefined && validationArguments.value !== null && typeof validationArguments.value === "string")
                messageString = messageString.replace(/\$value/g, validationArguments.value);
            if (messageString)
                messageString = messageString.replace(/\$property/g, validationArguments.property);
            if (messageString)
                messageString = messageString.replace(/\$target/g, validationArguments.targetName);
            return messageString;
        };
        return ValidationUtils;
    }());

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
    var ValidationExecutor = /** @class */ (function () {
        // -------------------------------------------------------------------------
        // Constructor
        // -------------------------------------------------------------------------
        function ValidationExecutor(validator, validatorOptions) {
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
        ValidationExecutor.prototype.execute = function (object, targetSchema, validationErrors) {
            var _this = this;
            /**
             * If there is no metadata registered it means possibly the dependencies are not flatterned and
             * more than one instance is used.
             *
             * TODO: This needs proper handling, forcing to use the same container or some other proper solution.
             */
            if (!this.metadataStorage.hasValidationMetaData) {
                console.warn("No metadata found. There is more than once class-validator version installed probably. You need to flatten your dependencies.");
            }
            var groups = this.validatorOptions ? this.validatorOptions.groups : undefined;
            var targetMetadatas = this.metadataStorage.getTargetValidationMetadatas(object.constructor, targetSchema, groups);
            var groupedMetadatas = this.metadataStorage.groupByPropertyName(targetMetadatas);
            if (this.validatorOptions && this.validatorOptions.forbidUnknownValues && !targetMetadatas.length) {
                var validationError = new ValidationError();
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
            Object.keys(groupedMetadatas).forEach(function (propertyName) {
                var value = object[propertyName];
                var definedMetadatas = groupedMetadatas[propertyName].filter(function (metadata) { return metadata.type === ValidationTypes.IS_DEFINED; });
                var metadatas = groupedMetadatas[propertyName].filter(function (metadata) { return metadata.type !== ValidationTypes.IS_DEFINED && metadata.type !== ValidationTypes.WHITELIST; });
                if (value instanceof Promise && metadatas.find(function (metadata) { return metadata.type === ValidationTypes.PROMISE_VALIDATION; })) {
                    _this.awaitingPromises.push(value.then(function (resolvedValue) {
                        _this.performValidations(object, resolvedValue, propertyName, definedMetadatas, metadatas, validationErrors);
                    }));
                }
                else {
                    _this.performValidations(object, value, propertyName, definedMetadatas, metadatas, validationErrors);
                }
            });
        };
        ValidationExecutor.prototype.whitelist = function (object, groupedMetadatas, validationErrors) {
            var _this = this;
            var notAllowedProperties = [];
            Object.keys(object).forEach(function (propertyName) {
                // does this property have no metadata?
                if (!groupedMetadatas[propertyName] || groupedMetadatas[propertyName].length === 0)
                    notAllowedProperties.push(propertyName);
            });
            if (notAllowedProperties.length > 0) {
                if (this.validatorOptions && this.validatorOptions.forbidNonWhitelisted) {
                    // throw errors
                    notAllowedProperties.forEach(function (property) {
                        var _a;
                        var validationError = _this.generateValidationError(object, object[property], property);
                        validationError.constraints = (_a = {}, _a[ValidationTypes.WHITELIST] = "property " + property + " should not exist", _a);
                        validationError.children = undefined;
                        validationErrors.push(validationError);
                    });
                }
                else {
                    // strip non allowed properties
                    notAllowedProperties.forEach(function (property) { return delete object[property]; });
                }
            }
        };
        ValidationExecutor.prototype.stripEmptyErrors = function (errors) {
            var _this = this;
            return errors.filter(function (error) {
                if (error.children) {
                    error.children = _this.stripEmptyErrors(error.children);
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
        };
        // -------------------------------------------------------------------------
        // Private Methods
        // -------------------------------------------------------------------------
        ValidationExecutor.prototype.performValidations = function (object, value, propertyName, definedMetadatas, metadatas, validationErrors) {
            var customValidationMetadatas = metadatas.filter(function (metadata) { return metadata.type === ValidationTypes.CUSTOM_VALIDATION; });
            var nestedValidationMetadatas = metadatas.filter(function (metadata) { return metadata.type === ValidationTypes.NESTED_VALIDATION; });
            var conditionalValidationMetadatas = metadatas.filter(function (metadata) { return metadata.type === ValidationTypes.CONDITIONAL_VALIDATION; });
            var validationError = this.generateValidationError(object, value, propertyName);
            validationErrors.push(validationError);
            var canValidate = this.conditionalValidations(object, value, conditionalValidationMetadatas);
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
        };
        ValidationExecutor.prototype.generateValidationError = function (object, value, propertyName) {
            var validationError = new ValidationError();
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
        };
        ValidationExecutor.prototype.conditionalValidations = function (object, value, metadatas) {
            return metadatas
                .map(function (metadata) { return metadata.constraints[0](object, value); })
                .reduce(function (resultA, resultB) { return resultA && resultB; }, true);
        };
        ValidationExecutor.prototype.customValidations = function (object, value, metadatas, error) {
            var _this = this;
            metadatas.forEach(function (metadata) {
                _this.metadataStorage
                    .getTargetValidatorConstraints(metadata.constraintCls)
                    .forEach(function (customConstraintMetadata) {
                    if (customConstraintMetadata.async && _this.ignoreAsyncValidations)
                        return;
                    var validationArguments = {
                        targetName: object.constructor ? object.constructor.name : undefined,
                        property: metadata.propertyName,
                        object: object,
                        value: value,
                        constraints: metadata.constraints
                    };
                    if (!metadata.each || !(value instanceof Array || value instanceof Set || value instanceof Map)) {
                        var validatedValue = customConstraintMetadata.instance.validate(value, validationArguments);
                        if (isPromise(validatedValue)) {
                            var promise = validatedValue.then(function (isValid) {
                                if (!isValid) {
                                    var _a = _this.createValidationError(object, value, metadata, customConstraintMetadata), type = _a[0], message = _a[1];
                                    error.constraints[type] = message;
                                    if (metadata.context) {
                                        if (!error.contexts) {
                                            error.contexts = {};
                                        }
                                        error.contexts[type] = Object.assign((error.contexts[type] || {}), metadata.context);
                                    }
                                }
                            });
                            _this.awaitingPromises.push(promise);
                        }
                        else {
                            if (!validatedValue) {
                                var _a = _this.createValidationError(object, value, metadata, customConstraintMetadata), type = _a[0], message = _a[1];
                                error.constraints[type] = message;
                            }
                        }
                        return;
                    }
                    // convert set and map into array
                    var arrayValue = convertToArray(value);
                    // Validation needs to be applied to each array item
                    var validatedSubValues = arrayValue.map(function (subValue) { return customConstraintMetadata.instance.validate(subValue, validationArguments); });
                    var validationIsAsync = validatedSubValues
                        .some(function (validatedSubValue) { return isPromise(validatedSubValue); });
                    if (validationIsAsync) {
                        // Wrap plain values (if any) in promises, so that all are async
                        var asyncValidatedSubValues = validatedSubValues
                            .map(function (validatedSubValue) { return isPromise(validatedSubValue) ? validatedSubValue : Promise.resolve(validatedSubValue); });
                        var asyncValidationIsFinishedPromise = Promise.all(asyncValidatedSubValues)
                            .then(function (flatValidatedValues) {
                            var validationResult = flatValidatedValues.every(function (isValid) { return isValid; });
                            if (!validationResult) {
                                var _a = _this.createValidationError(object, value, metadata, customConstraintMetadata), type = _a[0], message = _a[1];
                                error.constraints[type] = message;
                                if (metadata.context) {
                                    if (!error.contexts) {
                                        error.contexts = {};
                                    }
                                    error.contexts[type] = Object.assign((error.contexts[type] || {}), metadata.context);
                                }
                            }
                        });
                        _this.awaitingPromises.push(asyncValidationIsFinishedPromise);
                        return;
                    }
                    var validationResult = validatedSubValues.every(function (isValid) { return isValid; });
                    if (!validationResult) {
                        var _b = _this.createValidationError(object, value, metadata, customConstraintMetadata), type = _b[0], message = _b[1];
                        error.constraints[type] = message;
                    }
                });
            });
        };
        ValidationExecutor.prototype.nestedValidations = function (value, metadatas, errors) {
            var _this = this;
            if (value === void 0) {
                return;
            }
            metadatas.forEach(function (metadata) {
                var _a;
                if (metadata.type !== ValidationTypes.NESTED_VALIDATION &&
                    metadata.type !== ValidationTypes.PROMISE_VALIDATION) {
                    return;
                }
                if (value instanceof Array || value instanceof Set || value instanceof Map) {
                    // Treats Set as an array - as index of Set value is value itself and it is common case to have Object as value
                    var arrayLikeValue = value instanceof Set ? Array.from(value) : value;
                    arrayLikeValue.forEach(function (subValue, index) {
                        _this.performValidations(value, subValue, index.toString(), [], metadatas, errors);
                    });
                }
                else if (value instanceof Object) {
                    var targetSchema = typeof metadata.target === "string" ? metadata.target : metadata.target.name;
                    _this.execute(value, targetSchema, errors);
                }
                else {
                    var error = new ValidationError();
                    error.value = value;
                    error.property = metadata.propertyName;
                    error.target = metadata.target;
                    var _b = _this.createValidationError(metadata.target, value, metadata), type = _b[0], message = _b[1];
                    error.constraints = (_a = {},
                        _a[type] = message,
                        _a);
                    errors.push(error);
                }
            });
        };
        ValidationExecutor.prototype.mapContexts = function (object, value, metadatas, error) {
            var _this = this;
            return metadatas
                .forEach(function (metadata) {
                if (metadata.context) {
                    var customConstraint = void 0;
                    if (metadata.type === ValidationTypes.CUSTOM_VALIDATION) {
                        var customConstraints = _this.metadataStorage.getTargetValidatorConstraints(metadata.constraintCls);
                        customConstraint = customConstraints[0];
                    }
                    var type = _this.getConstraintType(metadata, customConstraint);
                    if (error.constraints[type]) {
                        if (!error.contexts) {
                            error.contexts = {};
                        }
                        error.contexts[type] = Object.assign((error.contexts[type] || {}), metadata.context);
                    }
                }
            });
        };
        ValidationExecutor.prototype.createValidationError = function (object, value, metadata, customValidatorMetadata) {
            var targetName = object.constructor ? object.constructor.name : undefined;
            var type = this.getConstraintType(metadata, customValidatorMetadata);
            var validationArguments = {
                targetName: targetName,
                property: metadata.propertyName,
                object: object,
                value: value,
                constraints: metadata.constraints
            };
            var message = metadata.message || "";
            if (!metadata.message &&
                (!this.validatorOptions || (this.validatorOptions && !this.validatorOptions.dismissDefaultMessages))) {
                if (customValidatorMetadata && customValidatorMetadata.instance.defaultMessage instanceof Function) {
                    message = customValidatorMetadata.instance.defaultMessage(validationArguments);
                }
            }
            var messageString = ValidationUtils.replaceMessageSpecialTokens(message, validationArguments);
            return [type, messageString];
        };
        ValidationExecutor.prototype.getConstraintType = function (metadata, customValidatorMetadata) {
            var type = customValidatorMetadata && customValidatorMetadata.name ? customValidatorMetadata.name : metadata.type;
            return type;
        };
        return ValidationExecutor;
    }());

    /**
     * Validator performs validation of the given object based on its metadata.
     */
    var Validator = /** @class */ (function () {
        function Validator() {
        }
        // -------------------------------------------------------------------------
        // Private Properties
        // -------------------------------------------------------------------------
        /**
         * Performs validation of the given object based on decorators or validation schema.
         * Common method for `validateOrReject` and `validate` methods.
         */
        Validator.prototype.coreValidate = function (objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions) {
            var object = typeof objectOrSchemaName === "string" ? objectOrValidationOptions : objectOrSchemaName;
            var options = typeof objectOrSchemaName === "string" ? maybeValidatorOptions : objectOrValidationOptions;
            var schema = typeof objectOrSchemaName === "string" ? objectOrSchemaName : undefined;
            var executor = new ValidationExecutor(this, options);
            var validationErrors = [];
            executor.execute(object, schema, validationErrors);
            return Promise.all(executor.awaitingPromises).then(function () {
                return executor.stripEmptyErrors(validationErrors);
            });
        };
        /**
         * Performs validation of the given object based on decorators or validation schema.
         */
        Validator.prototype.validate = function (objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions) {
            return this.coreValidate(objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions);
        };
        /**
         * Performs validation of the given object based on decorators or validation schema and reject on error.
         */
        Validator.prototype.validateOrReject = function (objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var errors;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.coreValidate(objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions)];
                        case 1:
                            errors = _a.sent();
                            if (errors.length)
                                return [2 /*return*/, Promise.reject(errors)];
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Performs validation of the given object based on decorators or validation schema.
         */
        Validator.prototype.validateSync = function (objectOrSchemaName, objectOrValidationOptions, maybeValidatorOptions) {
            var object = typeof objectOrSchemaName === "string" ? objectOrValidationOptions : objectOrSchemaName;
            var options = typeof objectOrSchemaName === "string" ? maybeValidatorOptions : objectOrValidationOptions;
            var schema = typeof objectOrSchemaName === "string" ? objectOrSchemaName : undefined;
            var executor = new ValidationExecutor(this, options);
            executor.ignoreAsyncValidations = true;
            var validationErrors = [];
            executor.execute(object, schema, validationErrors);
            return executor.stripEmptyErrors(validationErrors);
        };
        return Validator;
    }());

    /**
     * Container to be used by this library for inversion control. If container was not implicitly set then by default
     * container simply creates a new instance of the given class.
     */
    var defaultContainer = new (/** @class */ (function () {
        function class_1() {
            this.instances = [];
        }
        class_1.prototype.get = function (someClass) {
            var instance = this.instances.find(function (instance) { return instance.type === someClass; });
            if (!instance) {
                instance = { type: someClass, object: new someClass() };
                this.instances.push(instance);
            }
            return instance.object;
        };
        return class_1;
    }()))();
    var userContainer;
    var userContainerOptions;
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
                var instance = userContainer.get(someClass);
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
            var args = {
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
    var ConstraintMetadata = /** @class */ (function () {
        // -------------------------------------------------------------------------
        // Constructor
        // -------------------------------------------------------------------------
        function ConstraintMetadata(target, name, async) {
            if (async === void 0) { async = false; }
            this.target = target;
            this.name = name;
            this.async = async;
        }
        Object.defineProperty(ConstraintMetadata.prototype, "instance", {
            // -------------------------------------------------------------------------
            // Accessors
            // -------------------------------------------------------------------------
            /**
             * Instance of the target custom validation class which performs validation.
             */
            get: function () {
                return getFromContainer(this.target);
            },
            enumerable: true,
            configurable: true
        });
        return ConstraintMetadata;
    }());

    /**
     * Registers a custom validation decorator.
     */
    function registerDecorator(options) {
        var constraintCls;
        if (options.validator instanceof Function) {
            constraintCls = options.validator;
            var constraintClasses = getFromContainer(MetadataStorage).getTargetValidatorConstraints(options.validator);
            if (constraintClasses.length > 1) {
                throw "More than one implementation of ValidatorConstraintInterface found for validator on: " + options.target + ":" + options.propertyName;
            }
        }
        else {
            var validator_1 = options.validator;
            constraintCls = /** @class */ (function () {
                function CustomConstraint() {
                }
                CustomConstraint.prototype.validate = function (value, validationArguments) {
                    return validator_1.validate(value, validationArguments);
                };
                CustomConstraint.prototype.defaultMessage = function (validationArguments) {
                    if (validator_1.defaultMessage) {
                        return validator_1.defaultMessage(validationArguments);
                    }
                    return "";
                };
                return CustomConstraint;
            }());
            getMetadataStorage().addConstraintMetadata(new ConstraintMetadata(constraintCls, options.name, options.async));
        }
        var validationMetadataArgs = {
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
        return function (validationArguments) {
            var eachPrefix = validationOptions && validationOptions.each
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
    var IS_DEFINED = ValidationTypes.IS_DEFINED;
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
                validate: function (value) { return isDefined(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property should not be null or undefined"; }, validationOptions)
            }
        }, validationOptions);
    }

    /**
     * Checks if value is missing and if so, ignores all validators.
     */
    function IsOptional(validationOptions) {
        return function (object, propertyName) {
            var args = {
                type: ValidationTypes.CONDITIONAL_VALIDATION,
                target: object.constructor,
                propertyName: propertyName,
                constraints: [function (object, value) {
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
            var isAsync = options && options.async ? true : false;
            var name = options && options.name ? options.name : "";
            if (!name) {
                name = target.name;
                if (!name) // generate name if it was not given
                    name = name.replace(/\.?([A-Z]+)/g, function (x, y) { return "_" + y.toLowerCase(); }).replace(/^_/, "");
            }
            var metadata = new ConstraintMetadata(target, name, isAsync);
            getMetadataStorage().addConstraintMetadata(metadata);
        };
    }
    function Validate(constraintClass, constraintsOrValidationOptions, maybeValidationOptions) {
        return function (object, propertyName) {
            var args = {
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
            var args = {
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
        var opts = tslib_1.__assign({}, validationOptions);
        var eachPrefix = opts.each ? "each value in " : "";
        opts.message = opts.message || eachPrefix + "nested property $property must be either object or array";
        return function (object, propertyName) {
            var args = {
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
            var args = {
                type: ValidationTypes.PROMISE_VALIDATION,
                target: object.constructor,
                propertyName: propertyName,
                validationOptions: validationOptions,
            };
            getMetadataStorage().addValidationMetadata(new ValidationMetadata(args));
        };
    }

    var IS_LATLONG = "isLatLong";
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
                validate: function (value, args) { return isLatLong(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a latitude,longitude string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_LATITUDE = "isLatitude";
    /**
     * Checks if a given value is a latitude.
     */
    function isLatitude(value) {
        return (typeof value === "number" || typeof value === "string") && isLatLong(value + ",0");
    }
    /**
     * Checks if a given value is a latitude.
     */
    function IsLatitude(validationOptions) {
        return ValidateBy({
            name: IS_LATITUDE,
            validator: {
                validate: function (value, args) { return isLatitude(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a latitude string or number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_LONGITUDE = "isLongitude";
    /**
     * Checks if a given value is a longitude.
     */
    function isLongitude(value) {
        return (typeof value === "number" || typeof value === "string") && isLatLong("0," + value);
    }
    /**
     * Checks if a given value is a longitude.
     */
    function IsLongitude(validationOptions) {
        return ValidateBy({
            name: IS_LONGITUDE,
            validator: {
                validate: function (value, args) { return isLongitude(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a longitude string or number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var EQUALS = "equals";
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
                validate: function (value, args) { return equals(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be equal to $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var NOT_EQUALS = "notEquals";
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
                validate: function (value, args) { return notEquals(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property should not be equal to $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_EMPTY = "isEmpty";
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
                validate: function (value, args) { return isEmpty(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be empty"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_NOT_EMPTY = "isNotEmpty";
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
                validate: function (value, args) { return isNotEmpty(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property should not be empty"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_IN = "isIn";
    /**
     * Checks if given value is in a array of allowed values.
     */
    function isIn(value, possibleValues) {
        return !(possibleValues instanceof Array) || possibleValues.some(function (possibleValue) { return possibleValue === value; });
    }
    /**
     * Checks if given value is in a array of allowed values.
     */
    function IsIn(values, validationOptions) {
        return ValidateBy({
            name: IS_IN,
            constraints: [values],
            validator: {
                validate: function (value, args) { return isIn(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be one of the following values: $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_NOT_IN = "isNotIn";
    /**
     * Checks if given value not in a array of allowed values.
     */
    function isNotIn(value, possibleValues) {
        return !(possibleValues instanceof Array) || !possibleValues.some(function (possibleValue) { return possibleValue === value; });
    }
    /**
     * Checks if given value not in a array of allowed values.
     */
    function IsNotIn(values, validationOptions) {
        return ValidateBy({
            name: IS_NOT_IN,
            constraints: [values],
            validator: {
                validate: function (value, args) { return isNotIn(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property should not be one of the following values: $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_DIVISIBLE_BY = "isDivisibleBy";
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
                validate: function (value, args) { return isDivisibleBy(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be divisible by $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_POSITIVE = "isPositive";
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
                validate: function (value, args) { return isPositive(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a positive number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_NEGATIVE = "isNegative";
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
                validate: function (value, args) { return isNegative(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a negative number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var MAX = "max";
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
                validate: function (value, args) { return max(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must not be greater than $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var MIN = "min";
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
                validate: function (value, args) { return min(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must not be less than $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var MIN_DATE = "minDate";
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
                validate: function (value, args) { return minDate(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return "minimal allowed date for " + eachPrefix + "$property is $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var MAX_DATE = "maxDate";
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
                validate: function (value, args) { return maxDate(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return "maximal allowed date for " + eachPrefix + "$property is $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var CONTAINS = "contains";
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
                validate: function (value, args) { return contains(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain a $constraint1 string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var NOT_CONTAINS = "notContains";
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
                validate: function (value, args) { return notContains(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property should not contain a $constraint1 string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ALPHA = "isAlpha";
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
                validate: function (value, args) { return isAlpha(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain only letters (a-zA-Z)"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ALPHANUMERIC = "isAlphanumeric";
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
                validate: function (value, args) { return isAlphanumeric(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain only letters and numbers"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_DECIMAL = "isDecimal";
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
                validate: function (value, args) { return isDecimal(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property is not a valid decimal number."; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ASCII = "isAscii";
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
                validate: function (value, args) { return isAscii(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain only ASCII characters"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_BASE64 = "isBase64";
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
                validate: function (value, args) { return isBase64(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be base64 encoded"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_BYTE_LENGTH = "isByteLength";
    /**
     * Checks if the string's length (in bytes) falls in a range.
     * If given value is not a string, then it returns false.
     */
    function isByteLength(value, min, max) {
        return typeof value === "string" && validator.isByteLength(value, { min: min, max: max });
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
                validate: function (value, args) { return isByteLength(value, args.constraints[0], args.constraints[1]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property's byte length must fall into ($constraint1, $constraint2) range"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_CREDIT_CARD = "isCreditCard";
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
                validate: function (value, args) { return isCreditCard(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a credit card"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_CURRENCY = "isCurrency";
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
                validate: function (value, args) { return isCurrency(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a currency"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_EMAIL = "isEmail";
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
                validate: function (value, args) { return isEmail(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an email"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_FQDN = "isFqdn";
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
                validate: function (value, args) { return isFQDN(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid domain name"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_FULL_WIDTH = "isFullWidth";
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
                validate: function (value, args) { return isFullWidth(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain a full-width characters"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_HALF_WIDTH = "isHalfWidth";
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
                validate: function (value, args) { return isHalfWidth(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain a half-width characters"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_VARIABLE_WIDTH = "isVariableWidth";
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
                validate: function (value, args) { return isVariableWidth(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain a full-width and half-width characters"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_HEX_COLOR = "isHexColor";
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
                validate: function (value, args) { return isHexColor(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a hexadecimal color"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_HEXADECIMAL = "isHexadecimal";
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
                validate: function (value, args) { return isHexadecimal(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a hexadecimal number"; }, validationOptions)
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

    var IS_MAC_ADDRESS = "isMacAddress";
    /**
     * Check if the string is a MAC address.
     * If given value is not a string, then it returns false.
     */
    function isMACAddress(value, options) {
        return typeof value === "string" && validator.isMACAddress(value, options);
    }
    function IsMACAddress(optionsOrValidationOptionsArg, validationOptionsArg) {
        var options = !isValidationOptions(optionsOrValidationOptionsArg) ? optionsOrValidationOptionsArg : undefined;
        var validationOptions = isValidationOptions(optionsOrValidationOptionsArg) ? optionsOrValidationOptionsArg : validationOptionsArg;
        return ValidateBy({
            name: IS_MAC_ADDRESS,
            constraints: [options],
            validator: {
                validate: function (value, args) { return isMACAddress(value, options); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a MAC Address"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_IP = "isIp";
    /**
     * Checks if the string is an IP (version 4 or 6).
     * If given value is not a string, then it returns false.
     */
    function isIP(value, version) {
        var versionStr = version ? "" + version : undefined;
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
                validate: function (value, args) { return isIP(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an ip address"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_PORT = "isPort";
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
                validate: function (value, args) { return isPort(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a port"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ISBN = "isIsbn";
    /**
     * Checks if the string is an ISBN (version 10 or 13).
     * If given value is not a string, then it returns false.
     */
    function isISBN(value, version) {
        var versionStr = version ? "" + version : undefined;
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
                validate: function (value, args) { return isISBN(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an ISBN"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ISIN = "isIsin";
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
                validate: function (value, args) { return isISIN(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an ISIN (stock/security identifier)"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ISO8601 = "isIso8601";
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
                validate: function (value, args) { return isISO8601(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid ISO 8601 date string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_JSON = "isJson";
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
                validate: function (value, args) { return isJSON(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a json string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_JWT = "isJwt";
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
                validate: function (value, args) { return isJWT(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a jwt string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_LOWERCASE = "isLowercase";
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
                validate: function (value, args) { return isLowercase(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a lowercase string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_MOBILE_PHONE = "isMobilePhone";
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
                validate: function (value, args) { return isMobilePhone(value, args.constraints[0], args.constraints[1]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a phone number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ISO31661_ALPHA_2 = "isISO31661Alpha2";
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
                validate: function (value, args) { return isISO31661Alpha2(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid ISO31661 Alpha2 code"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ISO31661_ALPHA_3 = "isISO31661Alpha3";
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
                validate: function (value, args) { return isISO31661Alpha3(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid ISO31661 Alpha3 code"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_MONGO_ID = "isMongoId";
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
                validate: function (value, args) { return isMongoId(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a mongodb id"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_MULTIBYTE = "isMultibyte";
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
                validate: function (value, args) { return isMultibyte(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain one or more multibyte chars"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_SURROGATE_PAIR = "isSurrogatePair";
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
                validate: function (value, args) { return isSurrogatePair(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain any surrogate pairs chars"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_URL = "isUrl";
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
                validate: function (value, args) { return isURL(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an URL address"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_UUID = "isUuid";
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
                validate: function (value, args) { return isUUID(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an UUID"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_FIREBASE_PUSH_ID = "IsFirebasePushId";
    /**
     * Checks if the string is a Firebase Push Id
     * If given value is not a Firebase Push Id, it returns false
     */
    function isFirebasePushId(value) {
        var webSafeRegex = /^[a-zA-Z0-9_-]*$/;
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
                validate: function (value, args) { return isFirebasePushId(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a Firebase Push Id"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_UPPERCASE = "isUppercase";
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
                validate: function (value, args) { return isUppercase(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be uppercase"; }, validationOptions)
            }
        }, validationOptions);
    }

    var LENGTH = "length";
    /**
     * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs.
     * If given value is not a string, then it returns false.
     */
    function length(value, min, max) {
        return typeof value === "string" && validator.isLength(value, { min: min, max: max });
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
                validate: function (value, args) { return length(value, args.constraints[0], args.constraints[1]); },
                defaultMessage: buildMessage(function (eachPrefix, args) {
                    var isMinLength = args.constraints[0] !== null && args.constraints[0] !== undefined;
                    var isMaxLength = args.constraints[1] !== null && args.constraints[1] !== undefined;
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

    var MAX_LENGTH = "maxLength";
    /**
     * Checks if the string's length is not more than given number. Note: this function takes into account surrogate pairs.
     * If given value is not a string, then it returns false.
     */
    function maxLength(value, max) {
        return typeof value === "string" && validator.isLength(value, { min: 0, max: max });
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
                validate: function (value, args) { return maxLength(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be shorter than or equal to $constraint1 characters"; }, validationOptions)
            }
        }, validationOptions);
    }

    var MIN_LENGTH = "minLength";
    /**
     * Checks if the string's length is not less than given number. Note: this function takes into account surrogate pairs.
     * If given value is not a string, then it returns false.
     */
    function minLength(value, min) {
        return typeof value === "string" && validator.isLength(value, { min: min });
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
                validate: function (value, args) { return minLength(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be longer than or equal to $constraint1 characters"; }, validationOptions)
            }
        }, validationOptions);
    }

    var MATCHES = "matches";
    function matches(value, pattern, modifiers) {
        return typeof value === "string" && validator.matches(value, pattern, modifiers);
    }
    function Matches(pattern, modifiersOrAnnotationOptions, validationOptions) {
        var modifiers;
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
                validate: function (value, args) { return matches(value, args.constraints[0], args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix, args) { return eachPrefix + "$property must match $constraint1 regular expression"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_PHONE_NUMBER = "isPhoneNumber";
    /**
     * Checks if the string is a valid phone number.
     * @param value the potential phone number string to test
     * @param {string} region 2 characters uppercase country code (e.g. DE, US, CH).
     * If users must enter the intl. prefix (e.g. +41), then you may pass "ZZ" or null as region.
     * See [google-libphonenumber, metadata.js:countryCodeToRegionCodeMap on github]{@link https://github.com/ruimarinho/google-libphonenumber/blob/1e46138878cff479aafe2ce62175c6c49cb58720/src/metadata.js#L33}
     */
    function isPhoneNumber(value, region) {
        var phoneUtil = googleLibphonenumber.PhoneNumberUtil.getInstance();
        try {
            var phoneNum = phoneUtil.parseAndKeepRawInput(value, region);
            var result = phoneUtil.isValidNumber(phoneNum);
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
                validate: function (value, args) { return isPhoneNumber(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid phone number"; }, validationOptions),
            }
        }, validationOptions);
    }

    var IS_MILITARY_TIME = "isMilitaryTime";
    /**
     * Checks if the string represents a time without a given timezone in the format HH:MM (military)
     * If the given value does not match the pattern HH:MM, then it returns false.
     */
    function isMilitaryTime(value) {
        var militaryTimeRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
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
                validate: function (value, args) { return isMilitaryTime(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid representation of military time in the format HH:MM"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_HASH = "isHash";
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
                validate: function (value, args) { return isHash(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a hash of type $constraint1"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ISSN = "isISSN";
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
                validate: function (value, args) { return isISSN(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a ISSN"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_DATE_STRING = "isDateString";
    /**
     * Checks if a given value is a ISOString date.
     */
    function isDateString(value) {
        var regex = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[\+\-][0-2]\d(?:\:[0-5]\d)?)?$/g;
        return typeof value === "string" && regex.test(value);
    }
    /**
     * Checks if a given value is a ISOString date.
     */
    function IsDateString(validationOptions) {
        return ValidateBy({
            name: IS_DATE_STRING,
            validator: {
                validate: function (value, args) { return isDateString(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a ISOString"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_BOOLEAN_STRING = "isBooleanString";
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
                validate: function (value, args) { return isBooleanString(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a boolean string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_NUMBER_STRING = "isNumberString";
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
                validate: function (value, args) { return isNumberString(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a number string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_BASE32 = "isBase32";
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
                validate: function (value, args) { return isBase32(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be base32 encoded"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_BIC = "isBIC";
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
                validate: function (value, args) { return isBIC(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a BIC or SWIFT code"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_BTC_ADDRESS = "isBtcAddress";
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
                validate: function (value, args) { return isBtcAddress(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a BTC address"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_DATA_URI = "isDataURI";
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
                validate: function (value, args) { return isDataURI(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a data uri format"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_EAN = "isEAN";
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
                validate: function (value, args) { return isEAN(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an EAN (European Article Number)"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ETHEREUM_ADDRESS = "isEthereumAddress";
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
                validate: function (value, args) { return isEthereumAddress(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an Ethereum address"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_HSL = "isHSL";
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
                validate: function (value, args) { return isHSL(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a HSL color"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_IBAN = "isIBAN";
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
                validate: function (value, args) { return isIBAN(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an IBAN"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_IDENTITY_CARD = "isIdentityCard";
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
                validate: function (value, args) { return isIdentityCard(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a identity card number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ISRC = "isISRC";
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
                validate: function (value, args) { return isISRC(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an ISRC"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_LOCALE = "isLocale";
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
                validate: function (value, args) { return isLocale(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be locale"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_MAGNET_URI = "isMagnetURI";
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
                validate: function (value, args) { return isMagnetURI(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be magnet uri format"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_MIME_TYPE = "isMimeType";
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
                validate: function (value, args) { return isMimeType(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be MIME type format"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_OCTAL = "isOctal";
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
                validate: function (value, args) { return isOctal(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be valid octal number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_PASSPORT_NUMBER = "isPassportNumber";
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
                validate: function (value, args) { return isPassportNumber(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be valid passport number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_POSTAL_CODE = "isPostalCode";
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
                validate: function (value, args) { return isPostalCode(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a postal code"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_RFC_3339 = "isRFC3339";
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
                validate: function (value, args) { return isRFC3339(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be RFC 3339 date"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_RGB_COLOR = "isRgbColor";
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
                validate: function (value, args) { return isRgbColor(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be RGB color"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_SEM_VER = "isSemVer";
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
                validate: function (value, args) { return isSemVer(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a Semantic Versioning Specification"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_BOOLEAN = "isBoolean";
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
                validate: function (value, args) { return isBoolean(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a boolean value"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_DATE = "isDate";
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
                validate: function (value, args) { return isDate(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a Date instance"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_NUMBER = "isNumber";
    /**
     * Checks if a given value is a number.
     */
    function isNumber(value, options) {
        if (options === void 0) { options = {}; }
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
            var decimalPlaces = 0;
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
    function IsNumber(options, validationOptions) {
        if (options === void 0) { options = {}; }
        return ValidateBy({
            name: IS_NUMBER,
            constraints: [options],
            validator: {
                validate: function (value, args) { return isNumber(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a number conforming to the specified constraints"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ENUM = "isEnum";
    /**
     * Checks if a given value is an enum
     */
    function isEnum(value, entity) {
        var enumValues = Object.keys(entity)
            .map(function (k) { return entity[k]; });
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
                validate: function (value, args) { return isEnum(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid enum value"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_INT = "isInt";
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
                validate: function (value, args) { return isInt(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an integer number"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_STRING = "isString";
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
                validate: function (value, args) { return isString(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a string"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_ARRAY = "isArray";
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
                validate: function (value, args) { return isArray(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an array"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_OBJECT = "isObject";
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
                validate: function (value, args) { return isObject(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an object"; }, validationOptions)
            }
        }, validationOptions);
    }

    var ARRAY_CONTAINS = "arrayContains";
    /**
     * Checks if array contains all values from the given array of values.
     * If null or undefined is given then this function returns false.
     */
    function arrayContains(array, values) {
        if (!(array instanceof Array))
            return false;
        return values.every(function (value) { return array.indexOf(value) !== -1; });
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
                validate: function (value, args) { return arrayContains(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain $constraint1 values"; }, validationOptions)
            }
        }, validationOptions);
    }

    var ARRAY_NOT_CONTAINS = "arrayNotContains";
    /**
     * Checks if array does not contain any of the given values.
     * If null or undefined is given then this function returns false.
     */
    function arrayNotContains(array, values) {
        if (!(array instanceof Array))
            return false;
        return values.every(function (value) { return array.indexOf(value) === -1; });
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
                validate: function (value, args) { return arrayNotContains(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property should not contain $constraint1 values"; }, validationOptions)
            }
        }, validationOptions);
    }

    var ARRAY_NOT_EMPTY = "arrayNotEmpty";
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
                validate: function (value, args) { return arrayNotEmpty(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property should not be empty"; }, validationOptions)
            }
        }, validationOptions);
    }

    var ARRAY_MIN_SIZE = "arrayMinSize";
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
                validate: function (value, args) { return arrayMinSize(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain at least $constraint1 elements"; }, validationOptions)
            }
        }, validationOptions);
    }

    var ARRAY_MAX_SIZE = "arrayMaxSize";
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
                validate: function (value, args) { return arrayMaxSize(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain not more than $constraint1 elements"; }, validationOptions)
            }
        }, validationOptions);
    }

    var ARRAY_UNIQUE = "arrayUnique";
    /**
     * Checks if all array's values are unique. Comparison for objects is reference-based.
     * If null or undefined is given then this function returns false.
     */
    function arrayUnique(array) {
        if (!(array instanceof Array))
            return false;
        var uniqueItems = array.filter(function (a, b, c) { return c.indexOf(a) === b; });
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
                validate: function (value, args) { return arrayUnique(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "All $property's elements must be unique"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_NOT_EMPTY_OBJECT = "isNotEmptyObject";
    /**
     * Checks if the value is valid Object & not empty.
     * Returns false if the value is not an object or an empty valid object.
     */
    function isNotEmptyObject(value) {
        if (!isObject(value)) {
            return false;
        }
        for (var key in value) {
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
                validate: function (value, args) { return isNotEmptyObject(value); },
                defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a non-empty object"; }, validationOptions)
            }
        }, validationOptions);
    }

    var IS_INSTANCE = "isInstance";
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
                validate: function (value, args) { return isInstance(value, args.constraints[0]); },
                defaultMessage: buildMessage(function (eachPrefix, args) {
                    if (args.constraints[0]) {
                        return eachPrefix + ("$property must be an instance of " + args.constraints[0].name);
                    }
                    else {
                        return eachPrefix + (IS_INSTANCE + " decorator expects and object as value, but got falsy value.");
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

    exports.ARRAY_CONTAINS = ARRAY_CONTAINS;
    exports.ARRAY_MAX_SIZE = ARRAY_MAX_SIZE;
    exports.ARRAY_MIN_SIZE = ARRAY_MIN_SIZE;
    exports.ARRAY_NOT_CONTAINS = ARRAY_NOT_CONTAINS;
    exports.ARRAY_NOT_EMPTY = ARRAY_NOT_EMPTY;
    exports.ARRAY_UNIQUE = ARRAY_UNIQUE;
    exports.Allow = Allow;
    exports.ArrayContains = ArrayContains;
    exports.ArrayMaxSize = ArrayMaxSize;
    exports.ArrayMinSize = ArrayMinSize;
    exports.ArrayNotContains = ArrayNotContains;
    exports.ArrayNotEmpty = ArrayNotEmpty;
    exports.ArrayUnique = ArrayUnique;
    exports.CONTAINS = CONTAINS;
    exports.Contains = Contains;
    exports.EQUALS = EQUALS;
    exports.Equals = Equals;
    exports.IS_ALPHA = IS_ALPHA;
    exports.IS_ALPHANUMERIC = IS_ALPHANUMERIC;
    exports.IS_ARRAY = IS_ARRAY;
    exports.IS_ASCII = IS_ASCII;
    exports.IS_BASE32 = IS_BASE32;
    exports.IS_BASE64 = IS_BASE64;
    exports.IS_BIC = IS_BIC;
    exports.IS_BOOLEAN = IS_BOOLEAN;
    exports.IS_BOOLEAN_STRING = IS_BOOLEAN_STRING;
    exports.IS_BTC_ADDRESS = IS_BTC_ADDRESS;
    exports.IS_BYTE_LENGTH = IS_BYTE_LENGTH;
    exports.IS_CREDIT_CARD = IS_CREDIT_CARD;
    exports.IS_CURRENCY = IS_CURRENCY;
    exports.IS_DATA_URI = IS_DATA_URI;
    exports.IS_DATE = IS_DATE;
    exports.IS_DATE_STRING = IS_DATE_STRING;
    exports.IS_DECIMAL = IS_DECIMAL;
    exports.IS_DEFINED = IS_DEFINED;
    exports.IS_DIVISIBLE_BY = IS_DIVISIBLE_BY;
    exports.IS_EAN = IS_EAN;
    exports.IS_EMAIL = IS_EMAIL;
    exports.IS_EMPTY = IS_EMPTY;
    exports.IS_ENUM = IS_ENUM;
    exports.IS_ETHEREUM_ADDRESS = IS_ETHEREUM_ADDRESS;
    exports.IS_FIREBASE_PUSH_ID = IS_FIREBASE_PUSH_ID;
    exports.IS_FQDN = IS_FQDN;
    exports.IS_FULL_WIDTH = IS_FULL_WIDTH;
    exports.IS_HALF_WIDTH = IS_HALF_WIDTH;
    exports.IS_HASH = IS_HASH;
    exports.IS_HEXADECIMAL = IS_HEXADECIMAL;
    exports.IS_HEX_COLOR = IS_HEX_COLOR;
    exports.IS_HSL = IS_HSL;
    exports.IS_IBAN = IS_IBAN;
    exports.IS_IDENTITY_CARD = IS_IDENTITY_CARD;
    exports.IS_IN = IS_IN;
    exports.IS_INSTANCE = IS_INSTANCE;
    exports.IS_INT = IS_INT;
    exports.IS_IP = IS_IP;
    exports.IS_ISBN = IS_ISBN;
    exports.IS_ISIN = IS_ISIN;
    exports.IS_ISO31661_ALPHA_2 = IS_ISO31661_ALPHA_2;
    exports.IS_ISO31661_ALPHA_3 = IS_ISO31661_ALPHA_3;
    exports.IS_ISO8601 = IS_ISO8601;
    exports.IS_ISRC = IS_ISRC;
    exports.IS_ISSN = IS_ISSN;
    exports.IS_JSON = IS_JSON;
    exports.IS_JWT = IS_JWT;
    exports.IS_LATITUDE = IS_LATITUDE;
    exports.IS_LATLONG = IS_LATLONG;
    exports.IS_LOCALE = IS_LOCALE;
    exports.IS_LONGITUDE = IS_LONGITUDE;
    exports.IS_LOWERCASE = IS_LOWERCASE;
    exports.IS_MAC_ADDRESS = IS_MAC_ADDRESS;
    exports.IS_MAGNET_URI = IS_MAGNET_URI;
    exports.IS_MILITARY_TIME = IS_MILITARY_TIME;
    exports.IS_MIME_TYPE = IS_MIME_TYPE;
    exports.IS_MOBILE_PHONE = IS_MOBILE_PHONE;
    exports.IS_MONGO_ID = IS_MONGO_ID;
    exports.IS_MULTIBYTE = IS_MULTIBYTE;
    exports.IS_NEGATIVE = IS_NEGATIVE;
    exports.IS_NOT_EMPTY = IS_NOT_EMPTY;
    exports.IS_NOT_EMPTY_OBJECT = IS_NOT_EMPTY_OBJECT;
    exports.IS_NOT_IN = IS_NOT_IN;
    exports.IS_NUMBER = IS_NUMBER;
    exports.IS_NUMBER_STRING = IS_NUMBER_STRING;
    exports.IS_OBJECT = IS_OBJECT;
    exports.IS_OCTAL = IS_OCTAL;
    exports.IS_PASSPORT_NUMBER = IS_PASSPORT_NUMBER;
    exports.IS_PHONE_NUMBER = IS_PHONE_NUMBER;
    exports.IS_PORT = IS_PORT;
    exports.IS_POSITIVE = IS_POSITIVE;
    exports.IS_POSTAL_CODE = IS_POSTAL_CODE;
    exports.IS_RFC_3339 = IS_RFC_3339;
    exports.IS_RGB_COLOR = IS_RGB_COLOR;
    exports.IS_SEM_VER = IS_SEM_VER;
    exports.IS_STRING = IS_STRING;
    exports.IS_SURROGATE_PAIR = IS_SURROGATE_PAIR;
    exports.IS_UPPERCASE = IS_UPPERCASE;
    exports.IS_URL = IS_URL;
    exports.IS_UUID = IS_UUID;
    exports.IS_VARIABLE_WIDTH = IS_VARIABLE_WIDTH;
    exports.IsAlpha = IsAlpha;
    exports.IsAlphanumeric = IsAlphanumeric;
    exports.IsArray = IsArray;
    exports.IsAscii = IsAscii;
    exports.IsBIC = IsBIC;
    exports.IsBase32 = IsBase32;
    exports.IsBase64 = IsBase64;
    exports.IsBoolean = IsBoolean;
    exports.IsBooleanString = IsBooleanString;
    exports.IsBtcAddress = IsBtcAddress;
    exports.IsByteLength = IsByteLength;
    exports.IsCreditCard = IsCreditCard;
    exports.IsCurrency = IsCurrency;
    exports.IsDataURI = IsDataURI;
    exports.IsDate = IsDate;
    exports.IsDateString = IsDateString;
    exports.IsDecimal = IsDecimal;
    exports.IsDefined = IsDefined;
    exports.IsDivisibleBy = IsDivisibleBy;
    exports.IsEAN = IsEAN;
    exports.IsEmail = IsEmail;
    exports.IsEmpty = IsEmpty;
    exports.IsEnum = IsEnum;
    exports.IsEthereumAddress = IsEthereumAddress;
    exports.IsFQDN = IsFQDN;
    exports.IsFirebasePushId = IsFirebasePushId;
    exports.IsFullWidth = IsFullWidth;
    exports.IsHSL = IsHSL;
    exports.IsHalfWidth = IsHalfWidth;
    exports.IsHash = IsHash;
    exports.IsHexColor = IsHexColor;
    exports.IsHexadecimal = IsHexadecimal;
    exports.IsIBAN = IsIBAN;
    exports.IsIP = IsIP;
    exports.IsISBN = IsISBN;
    exports.IsISIN = IsISIN;
    exports.IsISO31661Alpha2 = IsISO31661Alpha2;
    exports.IsISO31661Alpha3 = IsISO31661Alpha3;
    exports.IsISO8601 = IsISO8601;
    exports.IsISRC = IsISRC;
    exports.IsISSN = IsISSN;
    exports.IsIdentityCard = IsIdentityCard;
    exports.IsIn = IsIn;
    exports.IsInstance = IsInstance;
    exports.IsInt = IsInt;
    exports.IsJSON = IsJSON;
    exports.IsJWT = IsJWT;
    exports.IsLatLong = IsLatLong;
    exports.IsLatitude = IsLatitude;
    exports.IsLocale = IsLocale;
    exports.IsLongitude = IsLongitude;
    exports.IsLowercase = IsLowercase;
    exports.IsMACAddress = IsMACAddress;
    exports.IsMagnetURI = IsMagnetURI;
    exports.IsMilitaryTime = IsMilitaryTime;
    exports.IsMimeType = IsMimeType;
    exports.IsMobilePhone = IsMobilePhone;
    exports.IsMongoId = IsMongoId;
    exports.IsMultibyte = IsMultibyte;
    exports.IsNegative = IsNegative;
    exports.IsNotEmpty = IsNotEmpty;
    exports.IsNotEmptyObject = IsNotEmptyObject;
    exports.IsNotIn = IsNotIn;
    exports.IsNumber = IsNumber;
    exports.IsNumberString = IsNumberString;
    exports.IsObject = IsObject;
    exports.IsOctal = IsOctal;
    exports.IsOptional = IsOptional;
    exports.IsPassportNumber = IsPassportNumber;
    exports.IsPhoneNumber = IsPhoneNumber;
    exports.IsPort = IsPort;
    exports.IsPositive = IsPositive;
    exports.IsPostalCode = IsPostalCode;
    exports.IsRFC3339 = IsRFC3339;
    exports.IsRgbColor = IsRgbColor;
    exports.IsSemVer = IsSemVer;
    exports.IsString = IsString;
    exports.IsSurrogatePair = IsSurrogatePair;
    exports.IsUUID = IsUUID;
    exports.IsUppercase = IsUppercase;
    exports.IsUrl = IsUrl;
    exports.IsVariableWidth = IsVariableWidth;
    exports.LENGTH = LENGTH;
    exports.Length = Length;
    exports.MATCHES = MATCHES;
    exports.MAX = MAX;
    exports.MAX_DATE = MAX_DATE;
    exports.MAX_LENGTH = MAX_LENGTH;
    exports.MIN = MIN;
    exports.MIN_DATE = MIN_DATE;
    exports.MIN_LENGTH = MIN_LENGTH;
    exports.Matches = Matches;
    exports.Max = Max;
    exports.MaxDate = MaxDate;
    exports.MaxLength = MaxLength;
    exports.MetadataStorage = MetadataStorage;
    exports.Min = Min;
    exports.MinDate = MinDate;
    exports.MinLength = MinLength;
    exports.NOT_CONTAINS = NOT_CONTAINS;
    exports.NOT_EQUALS = NOT_EQUALS;
    exports.NotContains = NotContains;
    exports.NotEquals = NotEquals;
    exports.Validate = Validate;
    exports.ValidateBy = ValidateBy;
    exports.ValidateIf = ValidateIf;
    exports.ValidateNested = ValidateNested;
    exports.ValidatePromise = ValidatePromise;
    exports.ValidationError = ValidationError;
    exports.ValidationTypes = ValidationTypes;
    exports.Validator = Validator;
    exports.ValidatorConstraint = ValidatorConstraint;
    exports.arrayContains = arrayContains;
    exports.arrayMaxSize = arrayMaxSize;
    exports.arrayMinSize = arrayMinSize;
    exports.arrayNotContains = arrayNotContains;
    exports.arrayNotEmpty = arrayNotEmpty;
    exports.arrayUnique = arrayUnique;
    exports.buildMessage = buildMessage;
    exports.contains = contains;
    exports.equals = equals;
    exports.getFromContainer = getFromContainer;
    exports.getMetadataStorage = getMetadataStorage;
    exports.isAlpha = isAlpha;
    exports.isAlphanumeric = isAlphanumeric;
    exports.isArray = isArray;
    exports.isAscii = isAscii;
    exports.isBIC = isBIC;
    exports.isBase32 = isBase32;
    exports.isBase64 = isBase64;
    exports.isBoolean = isBoolean;
    exports.isBooleanString = isBooleanString;
    exports.isBtcAddress = isBtcAddress;
    exports.isByteLength = isByteLength;
    exports.isCreditCard = isCreditCard;
    exports.isCurrency = isCurrency;
    exports.isDataURI = isDataURI;
    exports.isDate = isDate;
    exports.isDateString = isDateString;
    exports.isDecimal = isDecimal;
    exports.isDefined = isDefined;
    exports.isDivisibleBy = isDivisibleBy;
    exports.isEAN = isEAN;
    exports.isEmail = isEmail;
    exports.isEmpty = isEmpty;
    exports.isEnum = isEnum;
    exports.isEthereumAddress = isEthereumAddress;
    exports.isFQDN = isFQDN;
    exports.isFirebasePushId = isFirebasePushId;
    exports.isFullWidth = isFullWidth;
    exports.isHSL = isHSL;
    exports.isHalfWidth = isHalfWidth;
    exports.isHash = isHash;
    exports.isHexColor = isHexColor;
    exports.isHexadecimal = isHexadecimal;
    exports.isIBAN = isIBAN;
    exports.isIP = isIP;
    exports.isISBN = isISBN;
    exports.isISIN = isISIN;
    exports.isISO31661Alpha2 = isISO31661Alpha2;
    exports.isISO31661Alpha3 = isISO31661Alpha3;
    exports.isISO8601 = isISO8601;
    exports.isISRC = isISRC;
    exports.isISSN = isISSN;
    exports.isIdentityCard = isIdentityCard;
    exports.isIn = isIn;
    exports.isInstance = isInstance;
    exports.isInt = isInt;
    exports.isJSON = isJSON;
    exports.isJWT = isJWT;
    exports.isLatLong = isLatLong;
    exports.isLatitude = isLatitude;
    exports.isLocale = isLocale;
    exports.isLongitude = isLongitude;
    exports.isLowercase = isLowercase;
    exports.isMACAddress = isMACAddress;
    exports.isMagnetURI = isMagnetURI;
    exports.isMilitaryTime = isMilitaryTime;
    exports.isMimeType = isMimeType;
    exports.isMobilePhone = isMobilePhone;
    exports.isMongoId = isMongoId;
    exports.isMultibyte = isMultibyte;
    exports.isNegative = isNegative;
    exports.isNotEmpty = isNotEmpty;
    exports.isNotEmptyObject = isNotEmptyObject;
    exports.isNotIn = isNotIn;
    exports.isNumber = isNumber;
    exports.isNumberString = isNumberString;
    exports.isObject = isObject;
    exports.isOctal = isOctal;
    exports.isPassportNumber = isPassportNumber;
    exports.isPhoneNumber = isPhoneNumber;
    exports.isPort = isPort;
    exports.isPositive = isPositive;
    exports.isPostalCode = isPostalCode;
    exports.isRFC3339 = isRFC3339;
    exports.isRgbColor = isRgbColor;
    exports.isSemVer = isSemVer;
    exports.isString = isString;
    exports.isSurrogatePair = isSurrogatePair;
    exports.isURL = isURL;
    exports.isUUID = isUUID;
    exports.isUppercase = isUppercase;
    exports.isValidationOptions = isValidationOptions;
    exports.isVariableWidth = isVariableWidth;
    exports.length = length;
    exports.matches = matches;
    exports.max = max;
    exports.maxDate = maxDate;
    exports.maxLength = maxLength;
    exports.min = min;
    exports.minDate = minDate;
    exports.minLength = minLength;
    exports.notContains = notContains;
    exports.notEquals = notEquals;
    exports.registerDecorator = registerDecorator;
    exports.registerSchema = registerSchema;
    exports.useContainer = useContainer;
    exports.validate = validate;
    exports.validateOrReject = validateOrReject;
    exports.validateSync = validateSync;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map
