import { buildMessage, ValidateBy } from "../common/ValidateBy";
import ValidatorJS from "validator";
export var IS_ALPHANUMERIC = "isAlphanumeric";
/**
 * Checks if the string contains only letters and numbers.
 * If given value is not a string, then it returns false.
 */
export function isAlphanumeric(value, locale) {
    return typeof value === "string" && ValidatorJS.isAlphanumeric(value, locale);
}
/**
 * Checks if the string contains only letters and numbers.
 * If given value is not a string, then it returns false.
 */
export function IsAlphanumeric(locale, validationOptions) {
    return ValidateBy({
        name: IS_ALPHANUMERIC,
        constraints: [locale],
        validator: {
            validate: function (value, args) { return isAlphanumeric(value, args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain only letters and numbers"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsAlphanumeric.js.map
