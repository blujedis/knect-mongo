/**
 * Normalizes promise to return object containing { err, data }
 *
 * @param promise the promise to be wrapped.
 */
export declare const awaiter: <T, K extends string = "data">(promise: Promise<T>) => Promise<{
    err?: Error;
} & Record<K, T>>;
/**
 * Mixes in constructors.
 *
 * @param derivedCtor the derived constructor.
 * @param baseCtors based constructors.
 * @param statics when true extends static methods.
 */
export declare const mixin: (derivedCtor: any, baseCtors: any[], statics?: boolean) => void;
/**
 * Checks if is a class
 *
 * @param fn the function or class with constructor to inspect.
 */
export declare function isClass(fn: any): boolean;
