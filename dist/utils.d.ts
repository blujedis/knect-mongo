/**
 * Normalizes promise to return object containing { err, data }
 *
 * @param promise the promise to be wrapped.
 */
export declare const awaiter: <T = any, K extends string = "data">(promise: Promise<T>) => Promise<{
    err?: Error;
} & Record<K, T>>;
