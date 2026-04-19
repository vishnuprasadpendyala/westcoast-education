import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { getStudent, logoutStudent } from '../../utils/storage.js';
import { getBookingsByStudent } from '../../services/bookingService.js';
import { getCourseById, getAllCourses } from '../../services/courseService.js';
import { formatPrice, formatDate, areaLabel } from '../../utils/formatters.js';
import { showError } from '../../utils/dom.js';

// Moduler
import { loadRecommendations } from './modules/recommendations.js';
import { loadMessages }        from './modules/messages.js';

renderNavbar();
renderFooter();

// Omdirigera om inte inloggad
const student = getStudent();
if (!student) location.href = '../student-login/student-login.html';

// Sätt studentinfo i sidebar
document.getElementById('studentName').textContent = student.name;
document.getElementById('studentEmail').textContent = student.email;
document.getElementById('welcomeName').textContent  = student.name.split(' ')[0];

// Avatar-initial
const avatarEl = document.getElementById('avatarInitial');
if (avatarEl) avatarEl.textContent = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();


// Delade hjälpfunktioner

const bookingItemHtml = (b) => {
  const labels = { confirmed: 'Bekräftad', cancelled: 'Avbokad', pending: 'Väntande' };
  return `
    <div class="booking-item">
      <div class="booking-item-info">
        <h3>${b.course?.title ?? 'Okänd kurs'}</h3>
        <p>${b.course ? formatDate(b.course.plannedDate) : '–'} &nbsp;·&nbsp;
           ${b.type === 'classroom' ? 'Klassrum' : 'Distans'} &nbsp;·&nbsp;
           Bokad: ${formatDate(b.bookingDate)}</p>
      </div>
      <div class="booking-item-meta">
        <strong>${formatPrice(b.amount)}</strong>
        <span class="status-badge status-${b.status}">${labels[b.status] ?? b.status}</span>
      </div>
    </div>`;
};

const progressBarHtml = (label, progress) => {
  const percent = Math.min(Math.max(Math.round(progress), 0), 100);
  const done    = percent === 100;
  return `
    <tr>
      <td class="progress-course-name">${label}</td>
      <td class="progress-bar-cell">
        <div class="progress-bar">
          <div class="progress-fill ${done ? 'completed' : ''}" style="width:${percent}%"></div>
        </div>
      </td>
      <td class="progress-percent ${done ? 'done' : ''}">${percent}%</td>
    </tr>`;
};

export const emptyStateHtml = (icon, title, text, link) => `
  <div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <h3>${title}</h3>
    <p>${text}</p>
    ${link ? `<a href="${link}" class="btn btn-primary btn-mt">Utforska kurser</a>` : ''}
  </div>`;

// Tab Loaders

const loadOverview = async () => {
  const el = document.getElementById('overview-content');
  try {
    const [bookings, allCourses] = await Promise.all([
      getBookingsByStudent(student.id),
      getAllCourses(),
    ]);
    const bookingsWithCourses = await Promise.all(
      bookings.map(async b => {
        try { return { ...b, course: await getCourseById(b.courseId) }; }
        catch { return { ...b, course: null }; }
      })
    );
    const totalSpent    = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const bookedCourses = bookingsWithCourses.filter(b => b.course);
    const courseProgressHtml = bookedCourses
      .map(b => progressBarHtml(b.course.title, b.progress ?? 0))
      .join('');

    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <span class="stat-value">${bookings.length}</span>
          <span class="stat-label">Bokade kurser</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <span class="stat-value">${formatPrice(totalSpent)}</span>
          <span class="stat-label">Totalt investerat</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <span class="stat-value">${student.xpPoints || 0}</span>
          <span class="stat-label">XP-poäng</span>
        </div>
      </div>
      ${bookedCourses.length === 0 ? '' : `
        <div class="progress-section">
          <p class="progress-section-title">Kursframsteg</p>
          <table class="progress-table">
            <thead>
              <tr>
                <th>Kurs</th>
                <th>Framsteg</th>
                <th style="text-align:right">%</th>
              </tr>
            </thead>
            <tbody>${courseProgressHtml}</tbody>
          </table>
        </div>`}
      <p class="section-title" style="margin-top:32px;">Senaste bokningar</p>
      ${bookingsWithCourses.length === 0
        ? emptyStateHtml('📭', 'Inga bokningar än', 'Du har inte bokat några kurser ännu.', '../courses/courses.html')
        : bookingsWithCourses.slice(0, 3).map(bookingItemHtml).join('')}`;
  } catch {
    showError(el, 'Kunde inte ladda översikt.');
  }
};

const loadBookings = async () => {
  const el = document.getElementById('bookings-content');
  try {
    const bookings = await getBookingsByStudent(student.id);
    const bookingsWithCourses = await Promise.all(
      bookings.map(async b => {
        try { return { ...b, course: await getCourseById(b.courseId) }; }
        catch { return { ...b, course: null }; }
      })
    );
    el.innerHTML = bookingsWithCourses.length === 0
      ? emptyStateHtml('📭', 'Inga bokningar', 'Du har inte bokat några kurser ännu.', '../courses/courses.html')
      : bookingsWithCourses.map(bookingItemHtml).join('');
  } catch {
    showError(el, 'Kunde inte ladda bokningar.');
  }
};

const loadProfile = () => {
  document.getElementById('profile-content').innerHTML = `
    <div class="profile-card">
      <h2>Personuppgifter</h2>
      ${[
        ['Namn',              'text',  student.name],
        ['E-postadress',      'email', student.email],
        ['Mobilnummer',       'tel',   student.phone || ''],
        ['Faktureringsadress','text',  student.address || ''],
        ['Medlem sedan',      'text',  formatDate(student.joinedDate)],
      ].map(([label, type, value]) => `
        <div class="form-group">
          <label>${label}</label>
          <input type="${type}" value="${value}" disabled />
        </div>`).join('')}
    </div>`;
};

// Flikväxling

document.getElementById('logoutBtn').addEventListener('click', () => {
  logoutStudent();
  location.href = '../../index.html';
});

document.querySelectorAll('.dash-link').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.dash-link').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dash-tab').forEach(t => t.hidden = true);
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`)?.removeAttribute('hidden');
    const actions = {
      overview:        loadOverview,
      bookings:        loadBookings,
      recommendations: () => loadRecommendations(student, emptyStateHtml),
      messages:        () => loadMessages(student, emptyStateHtml),
      profile:         loadProfile,
    };
    await actions[btn.dataset.tab]?.();
  });
});

// Ladda översikt vid start
loadOverview();