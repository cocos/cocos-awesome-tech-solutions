import { buildMessage, ValidateBy } from "../common/ValidateBy";
import ValidatorJS from "validator";
export const IS_IP = "isIp";
/**
 * Checks if the string is an IP (version 4 or 6).
 * If given value is not a string, then it returns false.
 */
export function isIP(value, version) {
    const versionStr = version ? `${version}` : undefined;
    return typeof value === "string" && ValidatorJS.isIP(value, versionStr);
}
/**
 * Checks if the string is an IP (version 4 or 6).
 * If given value is not a string, then it returns false.
 */
export function IsIP(version, validationOptions) {
    return ValidateBy({
        name: IS_IP,
        constraints: [version],
        validator: {
            validate: (value, args) => isIP(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be an ip address", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsIP.js.map
