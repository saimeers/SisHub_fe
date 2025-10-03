/**
 * @param {string} email 
 * @param {string[]} allowedDomains 
 * @returns {boolean} 
 */
export const isEmailDomainAllowed = (email, allowedDomains = ['ufps.edu.co']) => {
  if (!email) return false;
  
  const emailDomain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.includes(emailDomain);
};

/**
 * @param {string} email 
 * @returns {string} 
 */
export const getEmailDomain = (email) => {
  if (!email) return '';
  return email.split('@')[1]?.toLowerCase() || '';
};

/**
 * @param {string} email 
 * @returns {object} 
 */
export const validateEmailDomain = (email) => {
  const allowedDomains = ['ufps.edu.co'];
  const domain = getEmailDomain(email);
  const isValid = allowedDomains.includes(domain);

  return {
    isValid,
    domain,
    message: isValid 
      ? 'Dominio válido' 
      : `Solo se permiten correos institucionales`
  };
};