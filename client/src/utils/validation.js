/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if the email is valid, false otherwise
 */
export const validateEmail = (email) => {
  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validates if an email is in a specific domain format (e.g., gmail.com)
 * @param {string} email - The email address to validate
 * @param {string} domain - The domain to check for (e.g., 'gmail.com')
 * @returns {boolean} - True if the email matches the domain, false otherwise
 */
export const validateEmailDomain = (email, domain) => {
  if (!validateEmail(email)) return false;
  return email.toLowerCase().endsWith(`@${domain.toLowerCase()}`);
}; 