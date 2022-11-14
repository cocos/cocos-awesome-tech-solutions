import { buildMessage, ValidateBy } from "../common/ValidateBy";
import validator from "validator";
export var IS_MONGO_ID = "isMongoId";
/**
 * Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId.
 * If given value is not a string, then it returns false.
 */
export function isMongoId(value) {
    return typeof value === "string" && validator.isMongoId(value);
}
/**
 * Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId.
 * If given value is not a string, then it returns false.
 */
export function IsMongoId(validationOptions) {
    return ValidateBy({
        name: IS_MONGO_ID,
        validator: {
            validate: function (value, args) { return isMongoId(value); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a mongodb id"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsMongoId.js.map
