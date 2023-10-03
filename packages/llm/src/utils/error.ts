export class Unauthorized extends Error {
  status = 401;
  message = 'Unauthorized';
}
