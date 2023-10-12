export class CredentialsSignin extends Error {
  public status: number;
  public message: string;

  constructor(status = 401, message = 'CredentialsSignin') {
    super(message);
    this.status = status;
    this.message = message;
  }
}
