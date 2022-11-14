import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export const IS_UPPERCASE = "isUppercase";
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
            validate: (value, args) => isUppercase(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be uppercase", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsUppercase.js.map
