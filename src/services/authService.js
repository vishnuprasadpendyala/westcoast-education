import ApiClient from '../data/apiClient.js';
import { saveStudent, saveAdmin } from '../utils/storage.js';
import { generateId } from '../utils/formatters.js';

const studentsClient = new ApiClient('students');
const adminsClient   = new ApiClient('admins');

// Logga in en student med e-post och lösenord
export const loginStudent = async (email, password) => {
  const students = await studentsClient.filter(`email=${email}`);
  if (!students.length)
    throw new Error('E-postadressen finns inte registrerad.');
  const student = students[0];
  if (student.password !== password)
    throw new Error('Fel lösenord. Försök igen.');
  saveStudent(student);
  return student;
};

// Registrera en ny student och spara i sessionen
export const registerStudent = async (name, email, password, phone, address) => {
  const existing = await studentsClient.filter(`email=${email}`);
  if (existing.length)
    throw new Error('E-postadressen är redan registrerad.');
  const newStudent = {
    id: generateId(),
    name, email, password, phone, address,
    joinedDate: new Date().toISOString().split('T')[0],
    xpPoints: 0,
    interests: [],
    learningFocus: null,
    subscriptionActive: false,
  };
  const created = await studentsClient.create(newStudent);
  saveStudent(created);
  return created;
};

// Logga in en admin med e-post och lösenord
export const loginAdmin = async (email, password) => {
  const admins = await adminsClient.filter(`email=${email}`);
  if (!admins.length)
    throw new Error('Adminanvändaren finns inte.');
  const admin = admins[0];
  if (admin.password !== password)
    throw new Error('Fel lösenord.');
  saveAdmin(admin);
  return admin;
};