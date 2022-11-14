/**
 * These are the valid value types to use with the enum; enum must use a string
 * indexor but the value can be any of these types:
 */
declare type ValidEnumTypes = number | string | boolean;
/**
 * Use this along with TypeFromEnum to make a "fake" frozen enum which can be
 * used in place of an enum in ways that are mongoose-friendly and much more
 * flexible than a typescript enum. Example:
 *
 * const MyEnum = MakeEnum({
 *  key1: "value1",
 *  key2: "value2",
 *  key3: "value3",
 * });
 * type MyEnum = TypeFromEnum<typeof MyEnum>;
 *
 * // MyEnum will be type 'value1' | 'value2' | 'value3'
 * // MyEnum.key1, etc al work
 * // Object.values(MyEnum) will return ["value1", "value2", "value3"] e.g. for use in a mongoose enum
 * // assigning something of type MyEnum to the string value works
 *
 * You can also pass in multiple objects (or multiple enums created with this
 * helper) and the result will combine them with the actual value using Object.assign
 *
 * @param x Enum object to create a typed enum for
 */
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1): Readonly<T1>;
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, T2 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1, x2: T2): Readonly<T1 & T2>;
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, T2 extends {
    [index: string]: U;
}, T3 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1, x2: T2, x3: T3): Readonly<T1 & T2 & T3>;
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, T2 extends {
    [index: string]: U;
}, T3 extends {
    [index: string]: U;
}, T4 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1, x2: T2, x3: T3, x4: T4): Readonly<T1 & T2 & T3 & T4>;
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, T2 extends {
    [index: string]: U;
}, T3 extends {
    [index: string]: U;
}, T4 extends {
    [index: string]: U;
}, T5 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1, x2: T2, x3: T3, x4: T4, x5: T5): Readonly<T1 & T2 & T3 & T4 & T5>;
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, T2 extends {
    [index: string]: U;
}, T3 extends {
    [index: string]: U;
}, T4 extends {
    [index: string]: U;
}, T5 extends {
    [index: string]: U;
}, T6 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6): Readonly<T1 & T2 & T3 & T4 & T5 & T6>;
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, T2 extends {
    [index: string]: U;
}, T3 extends {
    [index: string]: U;
}, T4 extends {
    [index: string]: U;
}, T5 extends {
    [index: string]: U;
}, T6 extends {
    [index: string]: U;
}, T7 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7): Readonly<T1 & T2 & T3 & T4 & T5 & T6 & T7>;
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, T2 extends {
    [index: string]: U;
}, T3 extends {
    [index: string]: U;
}, T4 extends {
    [index: string]: U;
}, T5 extends {
    [index: string]: U;
}, T6 extends {
    [index: string]: U;
}, T7 extends {
    [index: string]: U;
}, T8 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7, x8: T8): Readonly<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8>;
declare function MakeEnum<T1 extends {
    [index: string]: U;
}, T2 extends {
    [index: string]: U;
}, T3 extends {
    [index: string]: U;
}, T4 extends {
    [index: string]: U;
}, T5 extends {
    [index: string]: U;
}, T6 extends {
    [index: string]: U;
}, T7 extends {
    [index: string]: U;
}, T8 extends {
    [index: string]: U;
}, T9 extends {
    [index: string]: U;
}, U extends ValidEnumTypes>(x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7, x8: T8, x9: T9): Readonly<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9>;
/**
 * Use this with MakeEnum. See docs for MakeEnum for example
 */
declare type TypeFromEnum<T extends object> = (T)[keyof T];
export { MakeEnum, TypeFromEnum };
