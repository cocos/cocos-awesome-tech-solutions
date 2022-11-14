import { ValidationOptions } from "../ValidationOptions";
export declare const IS_OBJECT = "isObject";
/**
 * Checks if the value is valid Object.
 * Returns false if the value is not an object.
 */
export declare function isObject(value: unknown): value is object;
/**
 * Checks if the value is valid Object.
 * Returns false if the value is not an object.
 */
export declare function IsObject(validationOptions?: ValidationOptions): PropertyDecorator;
