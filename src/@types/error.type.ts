export interface ResponseError {
  response?: {
    data: {
      message: string;
    };
    status: number;
  };
  message: string;
}
