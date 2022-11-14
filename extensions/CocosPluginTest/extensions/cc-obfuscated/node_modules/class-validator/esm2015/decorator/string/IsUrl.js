import { buildMessage, ValidateBy } from "../common/ValidateBy";
import ValidatorJS from "validator";
export const IS_URL = "isUrl";
/**
 * Checks if the string is an url.
 * If given value is not a string, then it returns false.
 */
export function isURL(value, options) {
    return typeof value === "string" && ValidatorJS.isURL(value, options);
}
/**
 * Checks if the string is an url.
 * If given value is not a string, then it returns false.
 */
export function IsUrl(options, validationOptions) {
    return ValidateBy({
        name: IS_URL,
        constraints: [options],
        validator: {
            validate: (value, args) => isURL(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an URL address", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsUrl.js.map
