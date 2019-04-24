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

/**
 * Mixes in constructors.
 * 
 * @param derivedCtor the derived constructor.
 * @param baseCtors based constructors.
 */
export const mixin = (derivedCtor: any, baseCtors: any[]) => {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (name !== 'constructor') {
        derivedCtor.prototype[name] = baseCtor.prototype[name];
      }
    });
  });
};
