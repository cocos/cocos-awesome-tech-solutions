import { buildMessage, ValidateBy } from "../common/ValidateBy";
import ValidatorJS from "validator";
export const IS_CURRENCY = "isCurrency";
/**
 * Checks if the string is a valid currency amount.
 * If given value is not a string, then it returns false.
 */
export function isCurrency(value, options) {
    return typeof value === "string" && ValidatorJS.isCurrency(value, options);
}
/**
 * Checks if the string is a valid currency amount.
 * If given value is not a string, then it returns false.
 */
export function IsCurrency(options, validationOptions) {
    return ValidateBy({
        name: IS_CURRENCY,
        constraints: [options],
        validator: {
            validate: (value, args) => isCurrency(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => eachPrefix + "$property must be a currency", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsCurrency.js.map
