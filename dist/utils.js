"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = exports.fromNamespace = exports.toNamespace = exports.parseDbName = exports.promise = void 0;
/**
 * Normalizes promise to return object containing { err, data }
 *
 * @param promise the promise to be wrapped.
 */
function promise(p) {
    return p
        .then(data => ({ err: null, data }))
        .catch(err => ({ err, data: null }));
}
exports.promise = promise;
/**
 * Parses database name from Mongodb connection string.
 *
 * @param uri the Mongodb uri connection string.
 * @param def the default database name when not found in uri.
 */
function parseDbName(uri, def = '') {
    const str = uri.split('?')[0];
    if (!~str.indexOf('/'))
        return def;
    return str.split('/').pop();
}
exports.parseDbName = parseDbName;
/**
 * Converts a collection name and name/alias into a namespace.
 *
 * @param collection the collection name.
 * @param name the name to concat to collection name.
 */
function toNamespace(collection, name, delimiter = '.') {
    if (!name)
        return collection;
    return collection + delimiter + name;
}
exports.toNamespace = toNamespace;
/**
 * Breaks out a namespace to object with collection, name and original namespace.
 *
 * @param ns the namespace to be parsed.
 */
function fromNamespace(ns, delimiter = '.') {
    const segments = ns.split(delimiter);
    return {
        collection: segments[0],
        name: segments[1] || segments[0],
        ns
    };
}
exports.fromNamespace = fromNamespace;
exports.isPromise = val => Promise.resolve(val) === val;
//# sourceMappingURL=utils.js.map