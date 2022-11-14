import { ValidationTypes } from "../../validation/ValidationTypes";
import { ValidationMetadata } from "../../metadata/ValidationMetadata";
import { getMetadataStorage } from "../../metadata/MetadataStorage";
/**
 * Objects / object arrays marked with this decorator will also be validated.
 */
export function ValidateIf(condition, validationOptions) {
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

//# sourceMappingURL=ValidateIf.js.map
