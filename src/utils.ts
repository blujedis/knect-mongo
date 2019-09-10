import { AwaiterResponse } from './types';

/**
 * Normalizes promise to return object containing { err, data }
 * 
 * @param promise the promise to be wrapped.
 */
export const awaiter = <T, K extends string = 'data'>(promise: Promise<T>) => {
  return promise
    .then(data => ({ err: null, data }))
    .catch(err => ({ err })) as AwaiterResponse<T, K>;
};

/**
 * Mixes in constructors.
 * 
 * @param derivedCtor the derived constructor.
 * @param baseCtors based constructors.
 * @param statics when true extends static methods.
 */
export const mixin = (derivedCtor: any, baseCtors: any[], statics: boolean = false) => {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (name !== 'constructor') {
        derivedCtor.prototype[name] = baseCtor.prototype[name];
      }
    });
    Object.getOwnPropertyNames(baseCtor).forEach(name => {
      if (name !== 'prototype' && name !== 'length' && name !== 'name') {
        derivedCtor[name] = baseCtor[name];
      }
    });
  });
};

const toString = Function.prototype.toString;

function fnBody(fn) {
  return toString.call(fn).replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '');
}

/**
 * Checks if is a class
 * 
 * @param fn the function or class with constructor to inspect.
 */
export function isClass(fn) {
  return (typeof fn === 'function' &&
    (/^class[\s{]/.test(toString.call(fn)) ||
      (/classCallCheck\(/.test(fnBody(fn)))) // babel.js
  );
}
