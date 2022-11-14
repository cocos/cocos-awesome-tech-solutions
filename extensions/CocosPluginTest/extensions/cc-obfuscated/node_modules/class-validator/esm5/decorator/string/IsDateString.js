import { buildMessage, ValidateBy } from "../common/ValidateBy";
export var IS_DATE_STRING = "isDateString";
/**
 * Checks if a given value is a ISOString date.
 */
export function isDateString(value) {
    var regex = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[\+\-][0-2]\d(?:\:[0-5]\d)?)?$/g;
    return typeof value === "string" && regex.test(value);
}
/**
 * Checks if a given value is a ISOString date.
 */
export function IsDateString(validationOptions) {
    return ValidateBy({
        name: IS_DATE_STRING,
        validator: {
            validate: function (value, args) { return isDateString(value); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a ISOString"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsDateString.js.map
