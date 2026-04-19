import { getMessagesForUser, sendMessage, markMessageAsRead } from '../../../services/messageService.js';
import { getAllTeachers } from '../../../services/teacherService.js';
import { showError } from '../../../utils/dom.js';

export const loadMessages = async (student, emptyStateHtml) => {
  const el = document.getElementById('messages-content');
  try {
    const [messages, teachers] = await Promise.all([
      getMessagesForUser(student.id),
      getAllTeachers(),
    ]);

    const sorted = messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const unread = sorted.filter(m => !m.read).length;

    el.innerHTML = `
      <div class="admin-form-card" style="margin-bottom:24px;">
        <h2 class="instructor-title">Skicka meddelande</h2>
        <div class="form-group">
          <label>Till *</label>
          <select id="msgTo">
            <option value="a1" data-role="admin">Admin</option>
            ${teachers.map(t =>
              `<option value="${t.id}" data-role="teacher">${t.name} (Lärare)</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Ämne *</label>
          <input type="text" id="msgSubject" placeholder="Ämne..." />
        </div>
        <div class="form-group">
          <label>Meddelande *</label>
          <textarea id="msgBody" rows="4" placeholder="Skriv ditt meddelande..."></textarea>
        </div>
        <div id="msg-feedback"></div>
        <div class="form-actions">
          <button class="btn btn-primary" id="sendMsgBtn">Skicka meddelande</button>
        </div>
      </div>
      <p class="section-title">
        Inkorg (${sorted.length}${unread > 0 ? ` — ${unread} olästa` : ''})
      </p>
      ${sorted.length === 0
        ? emptyStateHtml('✉️', 'Inga meddelanden', 'Du har inga meddelanden ännu.')
        : sorted.map(m => `
            <div class="booking-item ${m.read ? '' : 'unread-message'}">
              <div class="booking-item-info">
                <h3>${m.subject}</h3>
                <p>${m.body}</p>
                <p style="font-size:0.8rem;color:var(--text-light);margin-top:4px;">
                  Från: ${m.fromName} — ${new Date(m.timestamp).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div class="booking-item-meta">
                ${m.read
                  ? '<span class="status-badge status-confirmed">Läst</span>'
                  : `<button class="btn btn-outline btn-sm mark-read-btn"
                      data-id="${m.id}">Markera som läst</button>`}
              </div>
            </div>`).join('')}`;

    document.getElementById('sendMsgBtn')?.addEventListener('click', async () => {
      const select  = document.getElementById('msgTo');
      const toId    = select.value;
      const toRole  = select.options[select.selectedIndex]?.dataset.role;
      const subject = document.getElementById('msgSubject').value.trim();
      const body    = document.getElementById('msgBody').value.trim();
      const fb      = document.getElementById('msg-feedback');

      if (!subject || !body) {
        fb.innerHTML = '<div class="alert alert-error">Fyll i både ämne och meddelande.</div>';
        return;
      }
      try {
        await sendMessage(student.id, student.name, 'student', toId, toRole, subject, body);
        fb.innerHTML = '<div class="alert alert-success">✅ Meddelandet har skickats!</div>';
        document.getElementById('msgSubject').value = '';
        document.getElementById('msgBody').value    = '';
        await loadMessages(student, emptyStateHtml);
      } catch {
        fb.innerHTML = '<div class="alert alert-error">Kunde inte skicka meddelandet.</div>';
      }
    });

    document.querySelectorAll('.mark-read-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try { await markMessageAsRead(btn.dataset.id); await loadMessages(student, emptyStateHtml); }
        catch { alert('Kunde inte markera meddelandet.'); }
      });
    });
  } catch {
    showError(el, 'Kunde inte ladda meddelanden.');
  }
};