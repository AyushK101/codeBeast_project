type ApiErrorType = {
  statusCode: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  stack?: string;
};

export default class ApiError extends Error implements ApiErrorType {
  constructor(
    public statusCode: number,
    public message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public error?: any,
    public stack?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    
     // Serialize the error into a plain object
     this.error = error
    //  ? {
    //      message: error?.message,
    //      name: error?.name,
    //      stack: error?.stack,
    //    }
    //  : null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
