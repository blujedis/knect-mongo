"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
/**
 * Base Validation Error class.
 */
class ValidationError extends Error {
    constructor(message, value, path, errors) {
        super(message);
        if (typeof path === 'object') {
            errors = path;
            path = undefined;
        }
        path = (path || '');
        errors = (errors || []);
        if (errors && !Array.isArray(errors))
            errors = [errors];
        // Include this error in errors array.
        errors = [{ message, value, path }, ...errors];
        this.value = value;
        this.path = path;
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=error.js.map