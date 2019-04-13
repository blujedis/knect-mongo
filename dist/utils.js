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
//# sourceMappingURL=utils.js.map