import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export const IS_UUID = "isUuid";
/**
 * Checks if the string is a UUID (version 3, 4 or 5).
 * If given value is not a string, then it returns false.
 */
export function isUUID(value, version) {
    return typeof value === "string" && validator.isUUID(value, version);
}
/**
 * Checks if the string is a UUID (version 3, 4 or 5).
 * If given value is not a string, then it returns false.
 */
export function IsUUID(version, validationOptions) {
    return ValidateBy({
        name: IS_UUID,
        constraints: [version],
        validator: {
            validate: (value, args) => isUUID(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an UUID", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsUUID.js.map
