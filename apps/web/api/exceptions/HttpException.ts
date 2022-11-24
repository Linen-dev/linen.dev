export class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export class Unauthorized extends HttpException {
  constructor() {
    super(401, 'Unauthorized');
  }
}

export class Forbidden extends HttpException {
  constructor() {
    super(403, 'Forbidden');
  }
}

export class NotFound extends HttpException {
  constructor() {
    super(404, 'NotFound');
  }
}
