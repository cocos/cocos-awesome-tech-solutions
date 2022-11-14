import { buildMessage, ValidateBy } from "../common/ValidateBy";
import { isObject } from "../typechecker/IsObject";
export var IS_NOT_EMPTY_OBJECT = "isNotEmptyObject";
/**
 * Checks if the value is valid Object & not empty.
 * Returns false if the value is not an object or an empty valid object.
 */
export function isNotEmptyObject(value) {
    if (!isObject(value)) {
        return false;
    }
    for (var key in value) {
        if (value.hasOwnProperty(key)) {
            return true;
        }
    }
    return false;
}
/**
 * Checks if the value is valid Object & not empty.
 * Returns false if the value is not an object or an empty valid object.
 */
export function IsNotEmptyObject(validationOptions) {
    return ValidateBy({
        name: IS_NOT_EMPTY_OBJECT,
        validator: {
            validate: function (value, args) { return isNotEmptyObject(value); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a non-empty object"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsNotEmptyObject.js.map
