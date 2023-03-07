const emailRegex = new RegExp(/([^a-zA-Z0-9@.+_-])+/gi);

export const serializeEmail = (email: string) => {
  return email.split(',')[0].replace(emailRegex, '').toLowerCase();
};
