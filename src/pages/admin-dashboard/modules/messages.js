import { getAllMessages, sendMessage } from '../../../services/messageService.js';
import { getAllStudents } from '../../../services/studentService.js';
import { getAllTeachers } from '../../../services/teacherService.js';
import { showError } from '../../../utils/dom.js';
import { getAdmin } from '../../../utils/storage.js';

// Ladda meddelandefliken för admin
export const loadAdminMessages = async () => {
  const el    = document.getElementById('admin-messages-content');
  const admin = getAdmin();
  try {
    // Hämta alla meddelanden, studenter och lärare parallellt
    const [allMessages, students, teachers] = await Promise.all([
      getAllMessages(), getAllStudents(), getAllTeachers(),
    ]);

    // Filtrera — visa bara meddelanden skickade till admin eller manuellt skickade av admin
    const messages = allMessages.filter(m =>
      m.toRole === 'admin' ||
      (m.fromId === admin.id && m.fromRole === 'admin')
    );

    // Sortera meddelanden — nyaste först
    const sorted      = messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const unreadCount = sorted.filter(m => !m.read).length;

    // Bygg mottagarlista med studenter och lärare
    const recipients = [
      ...students.map(s => ({ id: s.id, name: s.name, role: 'student' })),
      ...teachers.map(t => ({ id: t.id, name: t.name, role: 'teacher' })),
    ];

    el.innerHTML = `
      <div class="admin-form-card" style="margin-bottom:24px;">
        <h2 class="instructor-title">Skicka meddelande</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Till *</label>
            <select id="adminMsgTo">
              <option value="">Välj mottagare...</option>
              ${recipients.map(r =>
                `<option value="${r.id}" data-role="${r.role}">
                  ${r.name} (${r.role === 'student' ? 'Student' : 'Lärare'})
                </option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Ämne *</label>
            <input type="text" id="adminMsgSubject" placeholder="Ämne..." />
          </div>
        </div>
        <div class="form-group">
          <label>Meddelande *</label>
          <textarea id="adminMsgBody" rows="4" placeholder="Skriv ditt meddelande..."></textarea>
        </div>
        <div id="admin-msg-feedback"></div>
        <div class="form-actions">
          <button class="btn btn-primary" id="sendAdminMsgBtn">Skicka meddelande</button>
        </div>
      </div>

      <!-- Alla meddelanden med oläst-räknare -->
      <h2 class="bookings-heading">
        Alla meddelanden (${sorted.length}${unreadCount > 0 ? ` — ${unreadCount} olästa` : ''})
      </h2>
      ${sorted.length === 0
        ? `<div class="empty-state">
            <div class="empty-icon">✉️</div>
            <h3>Inga meddelanden</h3>
           </div>`
        : sorted.map(m => `
            <div class="booking-item ${m.read ? '' : 'unread-message'}">
              <div class="booking-item-info">
                <h3>${m.subject}</h3>
                <p>${m.body}</p>
                <p style="font-size:0.8rem;color:var(--text-light);margin-top:4px;">
                  Från: ${m.fromName} → Till: ${m.toId} —
                  ${new Date(m.timestamp).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div class="booking-item-meta">
                ${m.read
                  ? '<span class="status-badge status-confirmed">Läst</span>'
                  : '<span class="status-badge status-pending">Oläst</span>'}
              </div>
            </div>`).join('')}`;

    // Hantera skicka-knappen
    document.getElementById('sendAdminMsgBtn')?.addEventListener('click', async () => {
      const select   = document.getElementById('adminMsgTo');
      const toId     = select.value;
      const toRole   = select.options[select.selectedIndex]?.dataset.role;
      const subject  = document.getElementById('adminMsgSubject').value.trim();
      const body     = document.getElementById('adminMsgBody').value.trim();
      const feedback = document.getElementById('admin-msg-feedback');

      if (!toId || !subject || !body) {
        feedback.innerHTML = '<div class="alert alert-error">Fyll i alla fält.</div>';
        return;
      }
      try {
        await sendMessage(admin.id, admin.name, 'admin', toId, toRole, subject, body);
        feedback.innerHTML = '<div class="alert alert-success">Meddelandet har skickats!</div>';
        document.getElementById('adminMsgTo').value      = '';
        document.getElementById('adminMsgSubject').value = '';
        document.getElementById('adminMsgBody').value    = '';
        await loadAdminMessages();
      } catch {
        feedback.innerHTML = '<div class="alert alert-error">Kunde inte skicka meddelandet.</div>';
      }
    });
  } catch {
    showError(el, 'Kunde inte ladda meddelanden.');
  }
};