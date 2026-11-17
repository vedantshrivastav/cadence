export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(msg: string, details?: unknown) { return new AppError(400, msg, details); }
  static unauthorized(msg = "Not authenticated") { return new AppError(401, msg); }
  static forbidden(msg = "You do not have access to this resource") { return new AppError(403, msg); }
  static notFound(msg = "Resource not found") { return new AppError(404, msg); }
  static conflict(msg: string) { return new AppError(409, msg); }
}
