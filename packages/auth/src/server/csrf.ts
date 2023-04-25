import { createHash, randomBytes } from 'crypto';

/**
 * Ensure CSRF Token cookie is set for any subsequent requests.
 * Used as part of the strategy for mitigation for CSRF tokens.
 *
 * Creates a cookie like 'linen.csrf-token' with the value 'token|hash',
 * where 'token' is the CSRF token and 'hash' is a hash made of the token and
 * the secret, and the two values are joined by a pipe '|'. By storing the
 * value and the hash of the value (with the secret used as a salt) we can
 * verify the cookie was set by the server and not by a malicious attacker.
 *
 * For more details, see the following OWASP links:
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
 * https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf
 */

export function createCSRFToken() {
  // New CSRF token
  const csrfToken = randomBytes(32).toString('hex');
  const csrfTokenHash = createHash('sha256')
    .update(`${csrfToken}${process.env.NEXTAUTH_SECRET}`)
    .digest('hex');
  const token = `${csrfToken}|${csrfTokenHash}`;

  return token;
}

export function verifyCSRFToken(token: string) {
  const [csrfToken, csrfTokenHash] = token.split('|');
  const expectedCsrfTokenHash = createHash('sha256')
    .update(`${csrfToken}${process.env.NEXTAUTH_SECRET}`)
    .digest('hex');

  return csrfTokenHash === expectedCsrfTokenHash;
}
