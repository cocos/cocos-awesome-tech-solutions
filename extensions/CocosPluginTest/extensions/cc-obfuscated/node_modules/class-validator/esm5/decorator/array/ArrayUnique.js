import { buildMessage, ValidateBy } from "../common/ValidateBy";
export var ARRAY_UNIQUE = "arrayUnique";
/**
 * Checks if all array's values are unique. Comparison for objects is reference-based.
 * If null or undefined is given then this function returns false.
 */
export function arrayUnique(array) {
    if (!(array instanceof Array))
        return false;
    var uniqueItems = array.filter(function (a, b, c) { return c.indexOf(a) === b; });
    return array.length === uniqueItems.length;
}
/**
 * Checks if all array's values are unique. Comparison for objects is reference-based.
 * If null or undefined is given then this function returns false.
 */
export function ArrayUnique(validationOptions) {
    return ValidateBy({
        name: ARRAY_UNIQUE,
        validator: {
            validate: function (value, args) { return arrayUnique(value); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "All $property's elements must be unique"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=ArrayUnique.js.map
