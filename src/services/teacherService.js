import ApiClient from '../data/apiClient.js';
import { generateId } from '../utils/formatters.js';

const client = new ApiClient('teachers');

// Hämta alla lärare
export const getAllTeachers = () => client.listAll();

// Hämta en specifik lärare med ID
export const getTeacherById = (id) => client.getById(id);

// Ta bort en lärare
export const deleteTeacher = (id) => client.remove(id);

// Skapa en ny lärare med autogenererat ID
export const createTeacher = (data) => client.create({
  id: generateId(),
  ...data,
  courses: [],
});