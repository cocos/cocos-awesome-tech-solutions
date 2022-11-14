import { buildMessage, ValidateBy } from "../common/ValidateBy";
import ValidatorJS from "validator";
export var IS_NUMBER_STRING = "isNumberString";
/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
export function isNumberString(value, options) {
    return typeof value === "string" && ValidatorJS.isNumeric(value, options);
}
/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
export function IsNumberString(options, validationOptions) {
    return ValidateBy({
        name: IS_NUMBER_STRING,
        constraints: [options],
        validator: {
            validate: function (value, args) { return isNumberString(value, args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a number string"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsNumberString.js.map
