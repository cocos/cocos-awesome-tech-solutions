import { ValidationOptions } from "../ValidationOptions";
export declare const IS_ENUM = "isEnum";
/**
 * Checks if a given value is an enum
 */
export declare function isEnum(value: unknown, entity: any): boolean;
/**
 * Checks if a given value is an enum
 */
export declare function IsEnum(entity: Object, validationOptions?: ValidationOptions): PropertyDecorator;
