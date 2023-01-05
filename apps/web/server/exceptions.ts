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
  constructor(reason?: string) {
    super(403, reason || 'Forbidden');
  }
}

export class NotFound extends HttpException {
  constructor() {
    super(404, 'NotFound');
  }
}

export class InvalidCsrf extends HttpException {
  constructor() {
    super(400, 'InvalidCsrf');
  }
}

export class CredentialsSignin extends HttpException {
  constructor() {
    super(401, 'CredentialsSignin');
  }
}

export class NotImplemented extends HttpException {
  constructor() {
    super(501, 'NotImplemented');
  }
}

export class BadRequest extends HttpException {
  constructor(reason?: string) {
    super(400, reason || 'BadRequest');
  }
}
