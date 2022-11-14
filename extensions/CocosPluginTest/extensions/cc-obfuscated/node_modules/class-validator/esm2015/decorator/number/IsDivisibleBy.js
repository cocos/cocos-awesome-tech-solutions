import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export const IS_DIVISIBLE_BY = "isDivisibleBy";
/**
 * Checks if value is a number that's divisible by another.
 */
export function isDivisibleBy(value, num) {
    return typeof value === "number" &&
        typeof num === "number" &&
        validator.isDivisibleBy(String(value), num);
}
/**
 * Checks if value is a number that's divisible by another.
 */
export function IsDivisibleBy(num, validationOptions) {
    return ValidateBy({
        name: IS_DIVISIBLE_BY,
        constraints: [num],
        validator: {
            validate: (value, args) => isDivisibleBy(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be divisible by $constraint1", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsDivisibleBy.js.map
