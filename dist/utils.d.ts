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
 */
export declare const mixin: (derivedCtor: any, baseCtors: any[]) => void;
