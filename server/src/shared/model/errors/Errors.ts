export interface ValidationErrorExtract {
  path: string;
  message: string;
}

export interface ValidationErrorsWrapper {
  errors: ValidationErrorExtract[];
}
