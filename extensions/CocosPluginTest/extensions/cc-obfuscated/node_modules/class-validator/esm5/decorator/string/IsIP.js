import { buildMessage, ValidateBy } from "../common/ValidateBy";
import ValidatorJS from "validator";
export var IS_IP = "isIp";
/**
 * Checks if the string is an IP (version 4 or 6).
 * If given value is not a string, then it returns false.
 */
export function isIP(value, version) {
    var versionStr = version ? "" + version : undefined;
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
            validate: function (value, args) { return isIP(value, args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be an ip address"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsIP.js.map
