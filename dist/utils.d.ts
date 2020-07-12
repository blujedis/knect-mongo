/**
 * Normalizes promise to return object containing { err, data }
 *
 * @param promise the promise to be wrapped.
 */
export declare function promise<T, E extends Error = Error>(p: Promise<T>): Promise<{
    err?: E;
    data?: T;
}>;
/**
 * Parses database name from Mongodb connection string.
 *
 * @param uri the Mongodb uri connection string.
 * @param def the default database name when not found in uri.
 */
export declare function parseDbName(uri: string, def?: string): string;
/**
 * Converts a collection name and name/alias into a namespace.
 *
 * @param collection the collection name.
 * @param name the name to concat to collection name.
 */
export declare function toNamespace(collection: string, name?: string, delimiter?: string): string;
/**
 * Breaks out a namespace to object with collection, name and original namespace.
 *
 * @param ns the namespace to be parsed.
 */
export declare function fromNamespace(ns: string, delimiter?: string): {
    collection: string;
    name: string;
    ns: string;
};
export declare const isPromise: (val: any) => boolean;
