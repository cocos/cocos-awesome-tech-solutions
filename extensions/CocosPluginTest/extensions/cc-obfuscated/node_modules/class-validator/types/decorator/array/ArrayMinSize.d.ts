import { ValidationOptions } from "../ValidationOptions";
export declare const ARRAY_MIN_SIZE = "arrayMinSize";
/**
 * Checks if array's length is as minimal this number.
 * If null or undefined is given then this function returns false.
 */
export declare function arrayMinSize(array: unknown, min: number): boolean;
/**
 * Checks if array's length is as minimal this number.
 * If null or undefined is given then this function returns false.
 */
export declare function ArrayMinSize(min: number, validationOptions?: ValidationOptions): PropertyDecorator;
