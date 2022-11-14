import { buildMessage, ValidateBy } from "../common/ValidateBy";
export var IS_ENUM = "isEnum";
/**
 * Checks if a given value is an enum
 */
export function isEnum(value, entity) {
    var enumValues = Object.keys(entity)
        .map(function (k) { return entity[k]; });
    return enumValues.indexOf(value) >= 0;
}
/**
 * Checks if a given value is an enum
 */
export function IsEnum(entity, validationOptions) {
    return ValidateBy({
        name: IS_ENUM,
        constraints: [entity],
        validator: {
            validate: function (value, args) { return isEnum(value, args.constraints[0]); },
            defaultMessage: buildMessage(function (eachPrefix) { return eachPrefix + "$property must be a valid enum value"; }, validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=IsEnum.js.map
