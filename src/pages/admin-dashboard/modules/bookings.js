import { getAllCourses } from '../../../services/courseService.js';
import { sendMessage } from '../../../services/messageService.js';
import { formatPrice, formatDate, generateId } from '../../../utils/formatters.js';
import { showError } from '../../../utils/dom.js';
import ApiClient from '../../../data/apiClient.js';
import { getAdmin } from '../../../utils/storage.js';

const bookingClient = new ApiClient('bookings');
const refundClient  = new ApiClient('refunds');

// Ladda bokningsfliken grupperad per kurs
export const loadBookings = async () => {
  const el    = document.getElementById('bookings-content');
  const admin = getAdmin();
  try {
    const [courses, bookings] = await Promise.all([
      getAllCourses(), bookingClient.listAll(),
    ]);

    // Gruppera bokningar per kurs och filtrera bort kurser utan bokningar
    const bookingsByCourse = courses.map(c => ({
      course: c,
      bookings: bookings.filter(b => b.courseId === c.id),
    })).filter(g => g.bookings.length > 0);

    const today           = new Date();
    const threeWeeksFromNow = new Date();
    threeWeeksFromNow.setDate(today.getDate() + 21);

    // Hitta kurser med risk för inställning — färre än 5 bokningar inom 3 veckor
    const atRiskCourses = courses.filter(c => {
      const courseDate = new Date(c.plannedDate);
      const count      = bookings.filter(b => b.courseId === c.id).length;
      return courseDate <= threeWeeksFromNow && courseDate >= today && count < 5;
    });

    let html = '';

    // Visa varning för kurser med risk för inställning 
    if (atRiskCourses.length > 0) {
      html += `
        <div class="alert alert-error" style="margin-bottom:24px;">
          <strong>Varning!</strong> Följande kurser har färre än 5 bokningar och startar inom 3 veckor:
          <ul style="margin-top:8px;">
            ${atRiskCourses.map(c => {
              const count = bookings.filter(b => b.courseId === c.id).length;
              return `<li><strong>${c.title}</strong> (${c.courseNumber}) —
                ${count} bokning(ar) — Start: ${formatDate(c.plannedDate)}</li>`;
            }).join('')}
          </ul>
        </div>`;
    }

    if (bookingsByCourse.length === 0) {
      el.innerHTML = html + '<p class="no-bookings-text">Inga bokningar hittades.</p>';
      return;
    }

    // Bygg bokningstabell per kurs med åtgärdsknappar
    html += bookingsByCourse.map(g => {
      const courseDate      = new Date(g.course.plannedDate);
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(today.getDate() + 14);
      const withinTwoWeeks  = courseDate <= twoWeeksFromNow && courseDate >= today;

      return `
        <div class="booking-group">
          <div class="booking-group-header">
            <h3>${g.course.title} (${g.course.courseNumber})</h3>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span class="booking-count">${g.bookings.length} bokningar</span>
              ${withinTwoWeeks ? `
                <button class="btn btn-outline btn-sm send-reminder-btn"
                  data-course-id="${g.course.id}"
                  data-course-title="${g.course.title}"
                  data-course-date="${g.course.plannedDate}">
                  Skicka påminnelse
                </button>` : ''}
              <button class="btn btn-danger btn-sm cancel-course-btn"
                data-course-id="${g.course.id}"
                data-course-title="${g.course.title}"
                data-teacher-id="${g.course.teacher || ''}">
                Ställ in kurs
              </button>
            </div>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr>
                <th>Namn</th><th>E-post</th><th>Telefon</th>
                <th>Adress</th><th>Format</th><th>Belopp</th><th>Framsteg (%)</th>
              </tr></thead>
              <tbody>
                ${g.bookings.map(b => `<tr>
                  <td><strong>${b.customerName || '–'}</strong></td>
                  <td>${b.customerEmail || '–'}</td>
                  <td>${b.customerPhone || '–'}</td>
                  <td>${b.customerAddress || '–'}</td>
                  <td>${b.type === 'classroom' ? 'Klassrum' : 'Distans'}</td>
                  <td>${formatPrice(b.amount)}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input type="number" class="progress-input" data-id="${b.id}"
                        value="${b.progress ?? 0}" min="0" max="100"
                        style="width:64px;padding:4px 8px;border:1px solid var(--border-color);border-radius:6px;font-size:0.875rem;" />
                      <span style="font-size:0.8rem;color:var(--text-secondary)">%</span>
                    </div>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    }).join('');

    el.innerHTML = html;

    // Uppdatera kursframsteg i realtid
    document.querySelectorAll('.progress-input').forEach(input => {
      input.addEventListener('change', async () => {
        const progress = Math.min(Math.max(parseInt(input.value) || 0, 0), 100);
        input.value = progress;
        try { await bookingClient.update(input.dataset.id, { progress }); }
        catch { alert('Kunde inte uppdatera framsteg.'); }
      });
    });

    // Skicka startpåminnelse till bokade studenter
    document.querySelectorAll('.send-reminder-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const { courseId, courseTitle, courseDate } = btn.dataset;
        const courseBookings = bookings.filter(b => b.courseId === courseId);
        if (!courseBookings.length) { alert('Inga bokningar att skicka påminnelse till.'); return; }
        if (!confirm(`Skicka startpåminnelse till ${courseBookings.length} student(er) för "${courseTitle}"?`)) return;
        try {
          await Promise.all(courseBookings.map(b =>
            sendMessage(admin.id, admin.name, 'admin', b.studentId, 'student',
              `Påminnelse: ${courseTitle} startar snart`,
              `Hej! En påminnelse om att din kurs "${courseTitle}" startar ${formatDate(courseDate)}. Vi ser fram emot att träffa dig!`
            )
          ));
          alert(`Påminnelse skickad till ${courseBookings.length} student(er)!`);
        } catch { alert('Kunde inte skicka påminnelse.'); }
      });
    });

    // Ställ in kurs, meddela studenter och lärare, skapa återbetalningar
    document.querySelectorAll('.cancel-course-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const { courseId, courseTitle, teacherId } = btn.dataset;
        if (!confirm(`Är du säker på att du vill ställa in "${courseTitle}"?\nAlla bokade studenter och läraren meddelas.`)) return;
        const courseBookings = bookings.filter(b => b.courseId === courseId);
        try {
          // Skicka avbokningsmeddelande till varje student
          await Promise.all(courseBookings.map(b =>
            sendMessage(admin.id, admin.name, 'admin', b.studentId, 'student',
              `Kursen "${courseTitle}" är tyvärr inställd`,
              `Vi beklagar att meddela att kursen "${courseTitle}" måste ställas in på grund av för få deltagare. En full återbetalning på ${formatPrice(b.amount)} behandlas inom 5–7 arbetsdagar. Du är välkommen att boka om till en annan kurs.`
            )
          ));

          // Skapa återbetalningsposter i databasen
          await Promise.all(courseBookings.map(b =>
            refundClient.create({
              id: generateId(), bookingId: b.id, studentId: b.studentId,
              courseId, amount: b.amount,
              reason: 'Kurs inställd — för få deltagare',
              status: 'pending', createdAt: new Date().toISOString(),
            })
          ));

          // Meddela läraren om inställd kurs 
          if (teacherId) {
            await sendMessage(admin.id, admin.name, 'admin', teacherId, 'teacher',
              `Kurs inställd: "${courseTitle}"`,
              `Hej! Kursen "${courseTitle}" måste tyvärr ställas in på grund av för få deltagare. Tack för din förståelse.`
            );
          }

          alert(`Klart!\n• ${courseBookings.length} student(er) har meddelats\n• Återbetalningar initierade\n${teacherId ? '• Läraren har meddelats' : ''}`);
          await loadBookings();
        } catch { alert('Något gick fel. Försök igen.'); }
      });
    });

  } catch {
    showError(el, 'Kunde inte ladda bokningar.');
  }
};