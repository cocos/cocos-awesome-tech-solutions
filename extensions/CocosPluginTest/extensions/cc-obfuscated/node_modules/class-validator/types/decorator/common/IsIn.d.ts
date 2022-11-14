import { ValidationOptions } from "../ValidationOptions";
export declare const IS_IN = "isIn";
/**
 * Checks if given value is in a array of allowed values.
 */
export declare function isIn(value: unknown, possibleValues: unknown[]): boolean;
/**
 * Checks if given value is in a array of allowed values.
 */
export declare function IsIn(values: any[], validationOptions?: ValidationOptions): PropertyDecorator;
