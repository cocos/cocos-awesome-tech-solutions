import { buildMessage, ValidateBy } from "../common/ValidateBy";
import ValidatorJS from "validator";
export var IS_ALPHA = "isAlpha";
/**
 * Checks if the string contains only letters (a-zA-Z).
 * If given value is not a string, then it returns false.
 */
export function isAlpha(value, locale) {
    return typeof value === "string" && ValidatorJS.isAlpha(value, locale);
}
/**
 * Checks if the string contains only letters (a-zA-Z).
 * If given value is not a string, then it returns false.
 */
export function IsAlpha(locale, validationOptions) {
    return ValidateBy({
        name: IS_ALPHA,
        constraints: [locale],
        validator: {
            validate: function (value, args) { return isAlpha(value, args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain only letters (a-zA-Z)"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsAlpha.js.map
