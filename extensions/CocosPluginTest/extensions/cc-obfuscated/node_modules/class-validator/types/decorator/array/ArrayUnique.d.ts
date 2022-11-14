import { ValidationOptions } from "../ValidationOptions";
export declare const ARRAY_UNIQUE = "arrayUnique";
/**
 * Checks if all array's values are unique. Comparison for objects is reference-based.
 * If null or undefined is given then this function returns false.
 */
export declare function arrayUnique(array: unknown): boolean;
/**
 * Checks if all array's values are unique. Comparison for objects is reference-based.
 * If null or undefined is given then this function returns false.
 */
export declare function ArrayUnique(validationOptions?: ValidationOptions): PropertyDecorator;
