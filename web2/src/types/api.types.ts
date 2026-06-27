export interface IApiErrorDetail {
  field: string;
  message: string;
  value?: unknown;
  resource?: string;
}

export interface IApiErrorData {
  code: string;
  message: string;
  details?: IApiErrorDetail | IApiErrorDetail[] | Record<string, unknown>;
}

export interface IApiErrorResponse {
  success: false;
  error: IApiErrorData;
}

export interface IFormErrorHandler {
  setFieldError: (field: string, message: string) => void;
  setFormError: (message: string) => void;
}

export interface IErrorHandlerOptions {
  showToast?: boolean;
  formHandler?: IFormErrorHandler;
  fallbackMessage?: string;
}
