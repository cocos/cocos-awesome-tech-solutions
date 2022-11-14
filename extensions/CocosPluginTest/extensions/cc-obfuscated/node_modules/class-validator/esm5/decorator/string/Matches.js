import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export var MATCHES = "matches";
export function matches(value, pattern, modifiers) {
    return typeof value === "string" && validator.matches(value, pattern, modifiers);
}
export function Matches(pattern, modifiersOrAnnotationOptions, validationOptions) {
    var modifiers;
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
            validate: function (value, args) { return matches(value, args.constraints[0], args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix, args) { return eachPrefix + "$property must match $constraint1 regular expression"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=Matches.js.map
