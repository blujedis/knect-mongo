
/**
 * Normalizes promise to return object containing { err, data }
 * 
 * @param promise the promise to be wrapped.
 */
export function promise<T, E extends Error = Error>(p: Promise<T>) {
  return p
    .then(data => ({ err: null, data }))
    .catch(err => ({ err, data: null })) as Promise<{ err?: E, data?: T }>;
}

/**
 * Parses database name from Mongodb connection string.
 * 
 * @param uri the Mongodb uri connection string.
 * @param def the default database name when not found in uri.
 */
export function parseDbName(uri: string, def: string = '') {
  const str = uri.split('?')[0];
  if (!~str.indexOf('/'))
    return def;
  return str.split('/').pop();
}

/**
 * Converts a collection name and name/alias into a namespace.
 * 
 * @param collection the collection name.
 * @param name the name to concat to collection name.
 */
export function toNamespace(collection: string, name?: string, delimiter: string = '.') {
  if (!name)
    return collection;
  return collection + delimiter + name;
}

/**
 * Breaks out a namespace to object with collection, name and original namespace.
 * 
 * @param ns the namespace to be parsed.
 */
export function fromNamespace(ns: string, delimiter: string = '.') {
  const segments = ns.split(delimiter);
  return {
    collection: segments[0],
    name: segments[1] || segments[0],
    ns
  };
}

export const isPromise = val => Promise.resolve(val) === val;
