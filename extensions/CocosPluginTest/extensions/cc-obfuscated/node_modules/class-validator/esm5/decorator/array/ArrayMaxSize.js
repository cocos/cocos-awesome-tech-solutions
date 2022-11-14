import { buildMessage, ValidateBy } from "../common/ValidateBy";
export var ARRAY_MAX_SIZE = "arrayMaxSize";
/**
 * Checks if array's length is as maximal this number.
 * If null or undefined is given then this function returns false.
 */
export function arrayMaxSize(array, max) {
    return array instanceof Array && array.length <= max;
}
/**
 * Checks if array's length is as maximal this number.
 * If null or undefined is given then this function returns false.
 */
export function ArrayMaxSize(max, validationOptions) {
    return ValidateBy({
        name: ARRAY_MAX_SIZE,
        constraints: [max],
        validator: {
            validate: function (value, args) { return arrayMaxSize(value, args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain not more than $constraint1 elements"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=ArrayMaxSize.js.map
