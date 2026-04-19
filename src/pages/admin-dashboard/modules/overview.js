import { getAllCourses } from '../../../services/courseService.js';
import { getAllStudents } from '../../../services/studentService.js';
import { getAllTeachers } from '../../../services/teacherService.js';
import { formatPrice } from '../../../utils/formatters.js';
import { showError } from '../../../utils/dom.js';
import ApiClient from '../../../data/apiClient.js';

const bookingClient = new ApiClient('bookings');

// Ladda översiktsfliken med nyckelstatistik
export const loadOverview = async () => {
  const el = document.getElementById('overview-content');
  try {
    // Hämta alla nödvändiga data parallellt
    const [courses, students, bookings, teachers] = await Promise.all([
      getAllCourses(), getAllStudents(), bookingClient.listAll(), getAllTeachers(),
    ]);

    // Beräkna total omsättning från alla bokningar
    const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">${courses.length}</span>
          <span class="stat-label">Kurser</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${students.length}</span>
          <span class="stat-label">Studenter</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${bookings.length}</span>
          <span class="stat-label">Bokningar</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${formatPrice(revenue)}</span>
          <span class="stat-label">Total omsättning</span>
        </div>
      </div>`;
  } catch {
    showError(el, 'Kunde inte ladda översikt.');
  }
};