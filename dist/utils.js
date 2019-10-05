"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Normalizes promise to return object containing { err, data }
 *
 * @param promise the promise to be wrapped.
 */
exports.awaiter = (promise) => {
    return promise
        .then(data => ({ err: null, data }))
        .catch(err => ({ err }));
};
/**
 * Mixes in constructors.
 *
 * @param derivedCtor the derived constructor.
 * @param baseCtors based constructors.
 * @param statics when true extends static methods.
 */
exports.mixin = (derivedCtor, baseCtors, statics = false) => {
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
function isClass(fn) {
    return (typeof fn === 'function' &&
        (/^class[\s{]/.test(toString.call(fn)) ||
            (/classCallCheck\(/.test(fnBody(fn)))) // babel.js
    );
}
exports.isClass = isClass;
//# sourceMappingURL=utils.js.map