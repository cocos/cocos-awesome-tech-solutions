import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export var LENGTH = "length";
/**
 * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
export function length(value, min, max) {
    return typeof value === "string" && validator.isLength(value, { min: min, max: max });
}
/**
 * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
export function Length(min, max, validationOptions) {
    return ValidateBy({
        name: LENGTH,
        constraints: [min, max],
        validator: {
            validate: function (value, args) { return length(value, args.constraints[0], args.constraints[1]); },
            defaultMessage: buildMessage(function (eachPrefix, args) {
                var isMinLength = args.constraints[0] !== null && args.constraints[0] !== undefined;
                var isMaxLength = args.constraints[1] !== null && args.constraints[1] !== undefined;
                if (isMinLength && (!args.value || args.value.length < args.constraints[0])) {
                    return eachPrefix + "$property must be longer than or equal to $constraint1 characters";
                }
                else if (isMaxLength && (args.value.length > args.constraints[1])) {
                    return eachPrefix + "$property must be shorter than or equal to $constraint2 characters";
                }
                return eachPrefix + "$property must be longer than or equal to $constraint1 and shorter than or equal to $constraint2 characters";
            }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=Length.js.map
