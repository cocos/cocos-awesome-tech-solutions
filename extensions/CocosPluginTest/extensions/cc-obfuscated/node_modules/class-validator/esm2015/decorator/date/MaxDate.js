import { buildMessage, ValidateBy } from "../common/ValidateBy";
export const MAX_DATE = "maxDate";
/**
* Checks if the value is a date that's before the specified date.
*/
export function maxDate(date, maxDate) {
    return date instanceof Date && date.getTime() <= maxDate.getTime();
}
/**
 * Checks if the value is a date that's after the specified date.
 */
export function MaxDate(date, validationOptions) {
    return ValidateBy({
        name: MAX_DATE,
        constraints: [date],
        validator: {
            validate: (value, args) => maxDate(value, args.constraints[0]),
            defaultMessage: buildMessage((eachPrefix) => "maximal allowed date for " + eachPrefix + "$property is $constraint1", validationOptions)
        }
    }, validationOptions);
}

//# sourceMappingURL=MaxDate.js.map
