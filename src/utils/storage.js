const KEYS = {
  STUDENT: 'wce_student',
  ADMIN:   'wce_admin',
};

// --- Student ---

// Spara studentdata i sessionen
export const saveStudent = (s) =>
  sessionStorage.setItem(KEYS.STUDENT, JSON.stringify(s));

// Hämta inloggad student från sessionen
export const getStudent = () => {
  const d = sessionStorage.getItem(KEYS.STUDENT);
  return d ? JSON.parse(d) : null;
};

// Logga ut studenten genom att rensa sessionen
export const logoutStudent = () =>
  sessionStorage.removeItem(KEYS.STUDENT);

// Kontrollera om en student är inloggad
export const isStudentLoggedIn = () => !!getStudent();

// --- Admin ---

// Spara admindata i sessionen
export const saveAdmin = (a) =>
  sessionStorage.setItem(KEYS.ADMIN, JSON.stringify(a));

// Hämta inloggad admin från sessionen
export const getAdmin = () => {
  const d = sessionStorage.getItem(KEYS.ADMIN);
  return d ? JSON.parse(d) : null;
};

// Logga ut adminen genom att rensa sessionen
export const logoutAdmin = () =>
  sessionStorage.removeItem(KEYS.ADMIN);

// Kontrollera om en admin är inloggad
export const isAdminLoggedIn = () => !!getAdmin();