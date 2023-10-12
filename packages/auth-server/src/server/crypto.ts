import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const algorithm = 'aes-256-cbc';
const SECRET = process.env.NEXTAUTH_SECRET!;

export function encrypt(dataToEncrypt: string): string {
  if (!SECRET) {
    throw new Error('missing secret');
  }
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(SECRET, salt, 32);
  const iv = Buffer.alloc(16, 0); // Initialization vector.
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(dataToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${salt}:${encrypted}`;
}

export function decrypt(dataToDecrypt: string): string {
  if (!SECRET) {
    throw new Error('missing secret');
  }
  const [salt, encrypted] = dataToDecrypt.split(':');
  const key = scryptSync(SECRET, salt, 32);
  const iv = Buffer.alloc(16, 0); // Initialization vector.
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
