import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export const MATCHES = "matches";
export function matches(value, pattern, modifiers) {
    return typeof value === "string" && validator.matches(value, pattern, modifiers);
}
export function Matches(pattern, modifiersOrAnnotationOptions, validationOptions) {
    let modifiers;
    if (modifiersOrAnnotationOptions && modifiersOrAnnotationOptions instanceof Object && !validationOptions) {
        validationOptions = modifiersOrAnnotationOptions;
    }
    else {
        modifiers = modifiersOrAnnotationOptions;
    }
    return ValidateBy({
        name: MATCHES,
        constraints: [pattern, modifiers],
        validator: {
            validate: (value, args) => matches(value, args.constraints[0], args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix, args) => eachPrefix + "$property must match $constraint1 regular expression", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=Matches.js.map
