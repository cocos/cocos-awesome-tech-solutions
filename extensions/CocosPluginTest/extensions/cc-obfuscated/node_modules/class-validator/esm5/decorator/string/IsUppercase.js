import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export var IS_UPPERCASE = "isUppercase";
/**
 * Checks if the string is uppercase.
 * If given value is not a string, then it returns false.
 */
export function isUppercase(value) {
    return typeof value === "string" && validator.isUppercase(value);
}
/**
 * Checks if the string is uppercase.
 * If given value is not a string, then it returns false.
 */
export function IsUppercase(validationOptions) {
    return ValidateBy({
        name: IS_UPPERCASE,
        validator: {
            validate: function (value, args) { return isUppercase(value); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be uppercase"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsUppercase.js.map
