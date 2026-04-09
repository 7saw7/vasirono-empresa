export type ApiErrorDto = {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};

export type SuccessDto<T> = {
  success: true;
  data: T;
};

export type FailureDto = {
  success: false;
  error: ApiErrorDto;
};

export type ApiResult<T> = SuccessDto<T> | FailureDto;