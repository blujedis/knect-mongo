import { AwaiterResponse } from './types';
/**
 * Normalizes promise to return object containing { err, data }
 * 
 * @param promise the promise to be wrapped.
 */
export const awaiter = <T = any, K extends string = 'data'>(promise: Promise<T>) => {
  return promise
    .then(data => ({ err: null, data }))
    .catch(err => ({ err })) as AwaiterResponse<T, K>;
};
