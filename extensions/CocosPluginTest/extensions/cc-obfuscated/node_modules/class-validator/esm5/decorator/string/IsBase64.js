import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export var IS_BASE64 = "isBase64";
/**
 * Checks if a string is base64 encoded.
 * If given value is not a string, then it returns false.
 */
export function isBase64(value) {
    return typeof value === "string" && validator.isBase64(value);
}
/**
 * Checks if a string is base64 encoded.
 * If given value is not a string, then it returns false.
 */
export function IsBase64(validationOptions) {
    return ValidateBy({
        name: IS_BASE64,
        validator: {
            validate: function (value, args) { return isBase64(value); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be base64 encoded"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsBase64.js.map
