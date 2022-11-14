import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export const IS_MAGNET_URI = "isMagnetURI";
/**
 * Check if the string is a magnet uri format.
 * If given value is not a string, then it returns false.
 */
export function isMagnetURI(value) {
    return typeof value === "string" && validator.isMagnetURI(value);
}
/**
 * Check if the string is a magnet uri format.
 * If given value is not a string, then it returns false.
 */
export function IsMagnetURI(validationOptions) {
    return ValidateBy({
        name: IS_MAGNET_URI,
        validator: {
            validate: (value, args) => isMagnetURI(value),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be magnet uri format", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsMagnetURI.js.map
