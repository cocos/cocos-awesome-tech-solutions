import { ValidationOptions } from "../ValidationOptions";
export declare const IS_NOT_IN = "isNotIn";
/**
 * Checks if given value not in a array of allowed values.
 */
export declare function isNotIn(value: unknown, possibleValues: unknown[]): boolean;
/**
 * Checks if given value not in a array of allowed values.
 */
export declare function IsNotIn(values: any[], validationOptions?: ValidationOptions): PropertyDecorator;
