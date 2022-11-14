import { ValidationOptions } from "../ValidationOptions";
export declare const IS_NOT_EMPTY_OBJECT = "isNotEmptyObject";
/**
 * Checks if the value is valid Object & not empty.
 * Returns false if the value is not an object or an empty valid object.
 */
export declare function isNotEmptyObject(value: unknown): boolean;
/**
 * Checks if the value is valid Object & not empty.
 * Returns false if the value is not an object or an empty valid object.
 */
export declare function IsNotEmptyObject(validationOptions?: ValidationOptions): PropertyDecorator;
