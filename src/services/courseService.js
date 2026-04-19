import ApiClient from '../data/apiClient.js';

const client = new ApiClient('courses');

// Hämta alla kurser
export const getAllCourses = () => client.listAll();

// Hämta kurser filtrerade efter område
export const getCoursesByArea = (area) => client.filter(`area=${area}`);

// Hämta en specifik kurs med ID
export const getCourseById = (id) => client.getById(id);

// Skapa en ny kurs
export const createCourse = (data) => client.create(data);

// Uppdatera en befintlig kurs
export const updateCourse = (id, data) => client.update(id, data);

// Ta bort en kurs
export const deleteCourse = (id) => client.remove(id);

// Gruppera kurser efter område
export const groupByArea = (courses) =>
  courses.reduce((acc, course) => {
    if (!acc[course.area]) acc[course.area] = [];
    acc[course.area].push(course);
    return acc;
  }, {});