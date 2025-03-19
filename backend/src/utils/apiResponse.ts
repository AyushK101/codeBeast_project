export default class ApiResponse {
  constructor(
    public statusCode: number,
    public message: string,
    public data: unknown,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
