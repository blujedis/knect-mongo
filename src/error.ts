
export interface IValidationErrorItem {
  path: string;
  value: any;
  message: string;
}

/**
 * Base Validation Error class.
 */
export class ValidationError extends Error {

  path: string;
  value: any;
  errors?: IValidationErrorItem[];

  constructor(message: string, value: any, path: string, errors: IValidationErrorItem | IValidationErrorItem[]);
  constructor(message: string, value: any, errors: IValidationErrorItem | IValidationErrorItem[]);
  constructor(message: string, value: any, path: string);
  constructor(message: string, value: any);
  constructor(
    message: string,
    value: any,
    path?: string | IValidationErrorItem | IValidationErrorItem[],
    errors?: IValidationErrorItem | IValidationErrorItem[]) {

    super(message);

    if (typeof path === 'object') {
      errors = path;
      path = undefined;
    }

    path = (path || '') as string;
    errors = (errors || []) as IValidationErrorItem[];

    if (errors && !Array.isArray(errors))
      errors = [errors];

    // Include this error in errors array.
    errors = [{ message, value, path }, ...errors];

    this.value = value;
    this.path = path;
    this.errors = errors;

  }

}
