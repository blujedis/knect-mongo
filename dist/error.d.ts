export interface IValidationErrorItem {
    path: string;
    value: any;
    message: string;
}
/**
 * Base Validation Error class.
 */
export declare class ValidationError extends Error {
    path: string;
    value: any;
    errors?: IValidationErrorItem[];
    constructor(message: string, value: any, path: string, errors: IValidationErrorItem | IValidationErrorItem[]);
    constructor(message: string, value: any, errors: IValidationErrorItem | IValidationErrorItem[]);
    constructor(message: string, value: any, path: string);
    constructor(message: string, value: any);
}
