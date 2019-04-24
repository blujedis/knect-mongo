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
 */
exports.mixin = (derivedCtor, baseCtors) => {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    });
};
//# sourceMappingURL=utils.js.map