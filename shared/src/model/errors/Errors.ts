export interface ValidationErrorExtract {
  path: string;
  message: string;
}

export type ValidationErrors = ValidationErrorExtract[];

export interface ValidationErrorsWrapper {
  errors: ValidationErrors;
}
