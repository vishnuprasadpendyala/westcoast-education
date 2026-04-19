import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { getAdmin, logoutAdmin } from '../../utils/storage.js';

// Moduler
import { loadOverview }                from './modules/overview.js';
import { loadCourses, initCourses }    from './modules/courses.js';
import { loadStudents, initStudents }  from './modules/students.js';
import { loadTeachers, initTeachers }  from './modules/teachers.js';
import { loadBookings }                from './modules/bookings.js';
import { loadAdminMessages }           from './modules/messages.js';

renderNavbar();
renderFooter();

// Omdirigera om inte admin
const admin = getAdmin();
if (!admin) location.href = '../admin-login/admin-login.html';

// Sätt admininfo i sidebar
document.getElementById('adminName').textContent = admin.name;
document.getElementById('adminEmail').textContent = admin.email;

// Sätt initial i admin-avataren
const initial    = admin.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const avatarEl   = document.getElementById('adminInitial');
if (avatarEl) avatarEl.textContent = initial;

// --- Utloggning ---
document.getElementById('logoutBtn').addEventListener('click', () => {
  logoutAdmin();
  location.href = '../../index.html';
});

// --- Initiera formulärhanterare ---
initCourses();
initStudents();
initTeachers();

// --- Flikhantering ---
document.querySelectorAll('.dash-link').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.dash-link').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dash-tab').forEach(t => t.hidden = true);
    btn.classList.add('active');
    const tab = document.getElementById(`tab-${btn.dataset.tab}`);
    if (tab) tab.hidden = false;

    switch (btn.dataset.tab) {
      case 'overview':  await loadOverview(); break;
      case 'courses':   await loadCourses(); break;
      case 'students':  await loadStudents(); break;
      case 'teachers':  await loadTeachers(); break;
      case 'bookings':  await loadBookings(); break;
      case 'messages':  await loadAdminMessages(); break;
    }
  });
});

// Ladda översikt vid start
loadOverview();