import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export var CONTAINS = "contains";
/**
 * Checks if the string contains the seed.
 * If given value is not a string, then it returns false.
 */
export function contains(value, seed) {
    return typeof value === "string" && validator.contains(value, seed);
}
/**
 * Checks if the string contains the seed.
 * If given value is not a string, then it returns false.
 */
export function Contains(seed, validationOptions) {
    return ValidateBy({
        name: CONTAINS,
        constraints: [seed],
        validator: {
            validate: function (value, args) { return contains(value, args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must contain a $constraint1 string"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=Contains.js.map
