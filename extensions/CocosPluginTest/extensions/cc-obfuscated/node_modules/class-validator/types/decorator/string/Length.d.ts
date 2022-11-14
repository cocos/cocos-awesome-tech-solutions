import { ValidationOptions } from "../ValidationOptions";
export declare const LENGTH = "length";
/**
 * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
export declare function length(value: unknown, min: number, max?: number): boolean;
/**
 * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 * If given value is not a string, then it returns false.
 */
export declare function Length(min: number, max?: number, validationOptions?: ValidationOptions): PropertyDecorator;
