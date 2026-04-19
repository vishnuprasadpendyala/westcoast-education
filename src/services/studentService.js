import ApiClient from '../data/apiClient.js';

const client = new ApiClient('students');

// Hämta alla studenter
export const getAllStudents = () => client.listAll();

// Hämta en specifik student med ID
export const getStudentById = (id) => client.getById(id);

// Skapa en ny student
export const createStudent = (data) => client.create(data);

// Uppdatera en befintlig student
export const updateStudent = (id, data) => client.update(id, data);

// Ta bort en student
export const deleteStudent = (id) => client.remove(id);