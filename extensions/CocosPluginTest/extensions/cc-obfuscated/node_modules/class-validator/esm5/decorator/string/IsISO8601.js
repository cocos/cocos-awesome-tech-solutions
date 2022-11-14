import { buildMessage, ValidateBy } from "../common/ValidateBy";
import ValidatorJS from "validator";
export var IS_ISO8601 = "isIso8601";
/**
 * Checks if the string is a valid ISO 8601 date.
 * If given value is not a string, then it returns false.
 * Use the option strict = true for additional checks for a valid date, e.g. invalidates dates like 2019-02-29.
 */
export function isISO8601(value, options) {
    return typeof value === "string" && ValidatorJS.isISO8601(value, options);
}
/**
 * Checks if the string is a valid ISO 8601 date.
 * If given value is not a string, then it returns false.
 * Use the option strict = true for additional checks for a valid date, e.g. invalidates dates like 2019-02-29.
 */
export function IsISO8601(options, validationOptions) {
    return ValidateBy({
        name: IS_ISO8601,
        constraints: [options],
        validator: {
            validate: function (value, args) { return isISO8601(value, args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid ISO 8601 date string"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsISO8601.js.map
