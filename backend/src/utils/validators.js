const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email);

const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 6;

const isValidUsername = (username) =>
  typeof username === 'string' && username.trim().length >= 2 && username.trim().length <= 30;

module.exports = { isValidEmail, isValidPassword, isValidUsername };
