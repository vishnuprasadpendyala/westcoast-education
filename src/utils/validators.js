// Validera e-postadress med regex
export const validateEmail = (email) => {
  if (!email || !email.trim())
    return { valid: false, message: 'E-postadress krävs.' };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim())
    ? { valid: true }
    : { valid: false, message: 'Ange en giltig e-postadress.' };
};

// Validera lösenord – minst 6 tecken krävs
export const validatePassword = (password) => {
  if (!password)
    return { valid: false, message: 'Lösenord krävs.' };
  if (password.length < 6)
    return { valid: false, message: 'Lösenordet måste vara minst 6 tecken.' };
  return { valid: true };
};

// Validera att två lösenord matchar varandra
export const validatePasswordMatch = (pw, confirm) => {
  if (pw !== confirm)
    return { valid: false, message: 'Lösenorden stämmer inte överens.' };
  return { valid: true };
};

// Validera mobilnummer med regex
export const validatePhone = (phone) => {
  if (!phone || !phone.trim())
    return { valid: false, message: 'Mobilnummer krävs.' };
  const re = /^[\d\s\-+()]{7,15}$/;
  return re.test(phone.trim())
    ? { valid: true }
    : { valid: false, message: 'Ange ett giltigt mobilnummer.' };
};

// Validera att ett obligatoriskt fält inte är tomt
export const validateRequired = (value, fieldName = 'Fältet') => {
  if (!value || !value.trim())
    return { valid: false, message: `${fieldName} krävs.` };
  return { valid: true };
};