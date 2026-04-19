import { getStudent, getAdmin } from './storage.js';

// Omdirigera till inloggningssidan om studenten inte är inloggad
export const requireStudent = (redirectPath = '../student-login/student-login.html') => {
  if (!getStudent()) {
    location.href = redirectPath;
    return false;
  }
  return true;
};

// Omdirigera till adminlogginsidan om adminen inte är inloggad
export const requireAdmin = (redirectPath = '../admin-login/admin-login.html') => {
  if (!getAdmin()) {
    location.href = redirectPath;
    return false;
  }
  return true;
};