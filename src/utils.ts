
/**
 * Normalizes promise to return object containing { err, data }
 * 
 * @param key the property name for successfull result.
 * @param promise the promise to be wrapped.
 */
export const awaiter = (promise: Promise<any>, key?: string) => {
  key = key || 'data';
  return promise
    .then(data => ({ err: null, [key]: data }))
    .catch(err => ({ err, [key]: null })) as Promise<{ err?: Error, [key: string]: any }>;
};