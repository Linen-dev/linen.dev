/**
 * Validates the format of an email string.
 *
 * @param {string} emailString - The email string to be validated (comma-separated values or single email)
 * @returns {boolean} - Returns true if all email addresses are valid, otherwise false.
 */

export const isEmailValid = (emailString: string): boolean => {
  // Regular expression pattern to validate email addresses
  const emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

  // Split the email string by commas
  const emails = emailString.split(',');

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i].trim(); // Remove leading/trailing whitespace

    if (!emailPattern.test(email)) {
      return false; // Invalid email address
    }
  }

  return true; // All email addresses are valid
};
