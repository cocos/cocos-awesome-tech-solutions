import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export var IS_EAN = "isEAN";
/**
 * Check if the string is an EAN (European Article Number).
 * If given value is not a string, then it returns false.
 */
export function isEAN(value) {
    return typeof value === "string" && validator.isEAN(value);
}
/**
 * Check if the string is an EAN (European Article Number).
 * If given value is not a string, then it returns false.
 */
export function IsEAN(validationOptions) {
    return ValidateBy({
        name: IS_EAN,
        validator: {
            validate: function (value, args) { return isEAN(value); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an EAN (European Article Number)"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsEAN.js.map
