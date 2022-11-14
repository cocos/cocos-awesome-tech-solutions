import { ValidationOptions } from "../ValidationOptions";
export declare const ARRAY_MAX_SIZE = "arrayMaxSize";
/**
 * Checks if array's length is as maximal this number.
 * If null or undefined is given then this function returns false.
 */
export declare function arrayMaxSize(array: unknown, max: number): boolean;
/**
 * Checks if array's length is as maximal this number.
 * If null or undefined is given then this function returns false.
 */
export declare function ArrayMaxSize(max: number, validationOptions?: ValidationOptions): PropertyDecorator;
