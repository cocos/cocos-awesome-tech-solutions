import { ValidationOptions } from "../ValidationOptions";
export declare const IS_DATE_STRING = "isDateString";
/**
 * Checks if a given value is a ISOString date.
 */
export declare function isDateString(value: unknown): boolean;
/**
 * Checks if a given value is a ISOString date.
 */
export declare function IsDateString(validationOptions?: ValidationOptions): PropertyDecorator;
