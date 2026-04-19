import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { getCourseById, getAllCourses } from '../../services/courseService.js';
import { createBooking, getBookingsByStudent } from '../../services/bookingService.js';
import { createNotification } from '../../services/notificationService.js';
import { sendPurchaseRecommendation } from '../../services/messageService.js';
import ApiClient from '../../data/apiClient.js';
import { getParam, showError, showAlert } from '../../utils/dom.js';
import { formatPrice, formatDate, starsHtml, areaLabel } from '../../utils/formatters.js';
import { getStudent } from '../../utils/storage.js';
import { validateRequired, validateEmail, validatePhone } from '../../utils/validators.js';

renderNavbar();
renderFooter();

const teacherClient = new ApiClient('teachers');
const courseId = getParam('id');

let selectedType = null;

const renderCourse = (course, teacher, isBooked) => {
  const student = getStudent();
  const availLabels = { classroom: 'Klassrum', distance: 'Distans' };

  document.title = `${course.title} | Westcoast Education`;
  selectedType = course.availability[0];

  const typeSelector = course.availability.length > 1
    ? `<div class="type-selector">
        <label>Välj kursformat:</label>
        <div class="type-options">
          ${course.availability.map(a => `
            <button class="type-option ${a === selectedType ? 'selected' : ''}" data-type="${a}">
              ${availLabels[a] || a}
            </button>
          `).join('')}
        </div>
       </div>`
    : '';

  const bookingSection = student
    ? `<div class="booking-form">
        <h3>Boka kursen</h3>
        <input type="text" id="customerName" placeholder="Ditt namn *" value="${student.name || ''}" />
        <span class="field-error" id="err-name"></span>
        <input type="text" id="customerAddress" placeholder="Faktureringsadress *" value="${student.address || ''}" />
        <span class="field-error" id="err-address"></span>
        <input type="email" id="customerEmail" placeholder="E-postadress *" value="${student.email || ''}" />
        <span class="field-error" id="err-email"></span>
        <input type="tel" id="customerPhone" placeholder="Mobilnummer *" value="${student.phone || ''}" />
        <span class="field-error" id="err-phone"></span>
        <div id="booking-feedback"></div>
        <button class="btn btn-primary" id="book-btn">
          Boka nu – ${formatPrice(course.price)}
        </button>
       </div>`
    : `<div class="login-prompt">
        <p>Du måste vara inloggad för att boka.</p>
        <a href="../student-login/student-login.html" class="btn btn-primary btn-login-prompt">
          Logga in / Registrera dig
        </a>
       </div>`;

  // --- #26 Förhandsvisning ---
  const previewSection = `
    <div class="course-section">
      <h2>Förhandsvisning</h2>
      <p style="color:var(--text-secondary);margin-bottom:16px;font-size:0.9rem;">
        Se en kort introduktion till kursen innan du bokar.
      </p>

      ${isBooked
        ? `<!-- Upplåst för bokade studenter -->
           <div class="preview-unlocked">
             <span class="preview-badge">✅ Du har tillgång till denna kurs</span>
             <div class="preview-video preview-video--unlocked">
               <div class="preview-play-icon">▶</div>
               <p>Lektion 1: Introduktion till ${course.title}</p>
               <p style="font-size:0.8rem;opacity:0.7;">Fullständigt kursinnehåll tillgängligt i din profil</p>
             </div>
             <div class="preview-modules">
               <div class="preview-module preview-module--unlocked">
                 <span>📖</span>
                 <span>Modul 1 — Grundläggande koncept</span>
                 <span class="preview-duration">45 min</span>
               </div>
               <div class="preview-module preview-module--unlocked">
                 <span>📖</span>
                 <span>Modul 2 — Praktiska övningar</span>
                 <span class="preview-duration">60 min</span>
               </div>
               <div class="preview-module preview-module--unlocked">
                 <span>📖</span>
                 <span>Modul 3 — Fördjupning</span>
                 <span class="preview-duration">90 min</span>
               </div>
             </div>
           </div>`

        : `<!-- Låst förhandsvisning för icke-bokade -->
           <div class="preview-locked">
             <div class="preview-video preview-video--locked">
               <div class="preview-lock-icon">🔒</div>
               <p>Boka kursen för att få fullständig tillgång</p>
             </div>
             <div class="preview-modules">
               <div class="preview-module preview-module--unlocked">
                 <span>▶</span>
                 <span>Introduktion — Vad du kommer lära dig</span>
                 <span class="preview-duration">5 min · Gratis</span>
               </div>
               <div class="preview-module preview-module--locked">
                 <span>🔒</span>
                 <span>Modul 1 — Grundläggande koncept</span>
                 <span class="preview-duration">45 min</span>
               </div>
               <div class="preview-module preview-module--locked">
                 <span>🔒</span>
                 <span>Modul 2 — Praktiska övningar</span>
                 <span class="preview-duration">60 min</span>
               </div>
               <div class="preview-module preview-module--locked">
                 <span>🔒</span>
                 <span>Modul 3 — Fördjupning</span>
                 <span class="preview-duration">90 min</span>
               </div>
             </div>
             <p class="preview-cta">
               Boka kursen för att låsa upp allt innehåll —
               <strong>${course.days} dagar</strong> av intensiv utbildning.
             </p>
           </div>`
      }
    </div>`;

  document.getElementById('course-content').innerHTML = `
    <section class="course-hero">
      <div class="container">
        <div class="course-hero-inner">
          <div>
            <nav class="breadcrumb" aria-label="Brödsmulor">
              <a href="../../index.html">Hem</a>
              <span>›</span>
              <a href="../courses/courses.html">Kurser</a>
              <span>›</span>
              <span>${course.title}</span>
            </nav>
            <span class="badge badge-${course.area}">${areaLabel(course.area)}</span>
            <h1>${course.title}</h1>
            <p>${course.description}</p>
            <div class="course-hero-meta">
              <span class="meta-item">📋 ${course.courseNumber}</span>
              <span class="meta-item">📆 ${course.days} dagar</span>
              <span class="meta-item">📅 Start: ${formatDate(course.plannedDate)}</span>
              <span class="meta-item">${starsHtml(course.ratings)}</span>
            </div>
            <div class="availability-list">
              ${course.availability.map(a => `<span class="avail-tag">${availLabels[a] || a}</span>`).join('')}
            </div>
            ${teacher ? `
              <div class="teacher-info">
                <div class="teacher-avatar-sm">👤</div>
                <div class="teacher-info-text">
                  <strong>${teacher.name}</strong>
                  <span>Kursansvarig instruktör</span>
                </div>
              </div>` : ''}
          </div>
          <div class="booking-card">
            <div class="booking-price">${formatPrice(course.price)}</div>
            <div class="booking-details">
              <div class="booking-detail-row">
                <span>Kursnummer</span><span>${course.courseNumber}</span>
              </div>
              <div class="booking-detail-row">
                <span>Längd</span><span>${course.days} dagar</span>
              </div>
              <div class="booking-detail-row">
                <span>Startdatum</span><span>${formatDate(course.plannedDate)}</span>
              </div>
              <div class="booking-detail-row">
                <span>Format</span><span>${course.availability.map(a => availLabels[a]).join(', ')}</span>
              </div>
              <div class="booking-detail-row">
                <span>Betyg</span><span>${starsHtml(course.ratings)}</span>
              </div>
            </div>
            ${typeSelector}
            ${bookingSection}
          </div>
        </div>
      </div>
    </section>

    <section class="course-body">
      <div class="container">
        <div class="course-body-inner">
          <div>
            <div class="course-section">
              <h2>Om kursen</h2>
              <p>${course.description}</p>
            </div>

            ${previewSection}

            ${course.tags ? `
              <div class="course-section">
                <h2>Ämnesområden</h2>
                <div class="tags-list">
                  ${course.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
              </div>` : ''}
          </div>
          <div>
            ${teacher ? `
              <div class="card instructor-card">
                <h3 class="instructor-title">Din instruktör</h3>
                <div class="instructor-card-header">
                  <div class="instructor-avatar">👤</div>
                  <div>
                    <strong class="instructor-name">${teacher.name}</strong>
                    <span class="instructor-specialization">${areaLabel(teacher.specialization)}</span>
                  </div>
                </div>
                <p class="instructor-bio">${teacher.bio}</p>
              </div>` : ''}
          </div>
        </div>
      </div>
    </section>
  `;

  // Hantera formatväljar-knappar
  document.querySelectorAll('.type-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedType = btn.dataset.type;
    });
  });

  // Hantera bokningsknappen
  document.getElementById('book-btn')?.addEventListener('click', async () => {
    const feedback = document.getElementById('booking-feedback');

    ['err-name', 'err-address', 'err-email', 'err-phone'].forEach(id => {
      document.getElementById(id).textContent = '';
    });

    const name    = document.getElementById('customerName').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const email   = document.getElementById('customerEmail').value.trim();
    const phone   = document.getElementById('customerPhone').value.trim();

    let valid = true;
    const nv = validateRequired(name, 'Namn');
    if (!nv.valid) { document.getElementById('err-name').textContent = nv.message; valid = false; }
    const av = validateRequired(address, 'Faktureringsadress');
    if (!av.valid) { document.getElementById('err-address').textContent = av.message; valid = false; }
    const ev = validateEmail(email);
    if (!ev.valid) { document.getElementById('err-email').textContent = ev.message; valid = false; }
    const pv = validatePhone(phone);
    if (!pv.valid) { document.getElementById('err-phone').textContent = pv.message; valid = false; }
    if (!valid) return;

    const btn = document.getElementById('book-btn');
    btn.disabled = true;
    btn.textContent = 'Bokar...';

    try {
      const student = getStudent();

      await createBooking(student.id, course.id, selectedType, course.price, { name, address, email, phone });

      await createNotification(
        student.id,
        `Bokningsbekräftelse: Du har bokat "${course.title}" (${course.courseNumber}). Startdatum: ${formatDate(course.plannedDate)}. Pris: ${formatPrice(course.price)}. Format: ${selectedType === 'classroom' ? 'Klassrum' : 'Distans'}.`,
        'booking'
      );

      const allCourses = await getAllCourses();
      await sendPurchaseRecommendation(
        student.id,
        course.title,
        course.area,
        allCourses.filter(c => c.id !== course.id)
      );

      showAlert(feedback, `
        ✅ <strong>Bokning bekräftad!</strong><br><br>
        <strong>Kurs:</strong> ${course.title}<br>
        <strong>Kursnummer:</strong> ${course.courseNumber}<br>
        <strong>Format:</strong> ${selectedType === 'classroom' ? 'Klassrum' : 'Distans'}<br>
        <strong>Startdatum:</strong> ${formatDate(course.plannedDate)}<br>
        <strong>Pris:</strong> ${formatPrice(course.price)}<br><br>
        En bokningsbekräftelse har skickats till <strong>${email}</strong>.<br>
        Kolla dina <strong>Meddelanden</strong> i din profil för kursrekommendationer.<br>
        Välkommen till ${course.title}!
      `);

      btn.textContent = '✅ Bokad!';
    } catch (err) {
      showAlert(feedback, `Bokningen misslyckades: ${err.message}`, 'error');
      btn.disabled = false;
      btn.textContent = `Boka nu – ${formatPrice(course.price)}`;
    }
  });
};

// Initiera sidan
const init = async () => {
  const content = document.getElementById('course-content');
  if (!courseId) {
    showError(content, 'Inget kurs-ID angivet. Gå tillbaka och välj en kurs.');
    return;
  }
  try {
    const course = await getCourseById(courseId);

    // Kolla om studenten redan har bokat denna kurs
    let isBooked = false;
    const student = getStudent();
    if (student) {
      try {
        const bookings = await getBookingsByStudent(student.id);
        isBooked = bookings.some(b => b.courseId === courseId);
      } catch {
        isBooked = false;
      }
    }

    let teacher = null;
    if (course.teacher) {
      try { teacher = await teacherClient.getById(course.teacher); } catch (err) {
        console.warn('Kunde inte ladda lärare:', err);
      }
    }

    renderCourse(course, teacher, isBooked);
  } catch {
    showError(content, 'Kunde inte ladda kursen. Kontrollera att json-server körs.');
  }
};

init();