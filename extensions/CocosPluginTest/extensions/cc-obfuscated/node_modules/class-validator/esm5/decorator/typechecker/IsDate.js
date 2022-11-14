import { buildMessage, ValidateBy } from "../common/ValidateBy";
export var IS_DATE = "isDate";
/**
 * Checks if a given value is a number.
 */
export function isDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
/**
 * Checks if a value is a number.
 */
export function IsDate(validationOptions) {
    return ValidateBy({
        name: IS_DATE,
        validator: {
            validate: function (value, args) { return isDate(value); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a Date instance"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsDate.js.map
