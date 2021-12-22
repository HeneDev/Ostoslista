export type GroupedValidationError = Record<string, Record<string, string> | undefined>;

export interface ErrorResponse {
  message: string;
  stack?: string[];
  errors?: GroupedValidationError;
}
