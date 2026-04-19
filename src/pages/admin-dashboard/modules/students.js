import { getAllStudents, createStudent, deleteStudent } from '../../../services/studentService.js';
import { formatDate, generateId } from '../../../utils/formatters.js';
import { validateRequired, validateEmail, validatePhone, validatePassword } from '../../../utils/validators.js';
import { showAlert, showError } from '../../../utils/dom.js';

// Ladda och visa alla studenter i en tabell
export const loadStudents = async () => {
  const el = document.getElementById('students-content');
  try {
    const students = await getAllStudents();
    el.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>Namn</th><th>E-post</th><th>Telefon</th>
            <th>Adress</th><th>Medlem sedan</th><th>Åtgärd</th>
          </tr></thead>
          <tbody>
            ${students.map(s => `<tr>
              <td><strong>${s.name}</strong></td>
              <td>${s.email}</td>
              <td>${s.phone || '–'}</td>
              <td>${s.address || '–'}</td>
              <td>${formatDate(s.joinedDate)}</td>
              <td>
                <button class="btn btn-danger btn-sm delete-student-btn" data-id="${s.id}">
                  Ta bort
                </button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    // Hantera ta bort-knappar
    document.querySelectorAll('.delete-student-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Är du säker på att du vill ta bort denna student?')) return;
        try { await deleteStudent(btn.dataset.id); await loadStudents(); }
        catch { alert('Kunde inte ta bort studenten.'); }
      });
    });
  } catch {
    showError(el, 'Kunde inte ladda studenter.');
  }
};

// Initiera formulärhanterare för lägg till student
export const initStudents = () => {

  // Visa/dölj formulär för ny student
  document.getElementById('showAddStudentBtn').addEventListener('click', () => {
    const form = document.getElementById('add-student-form');
    form.hidden = !form.hidden;
  });

  // Avbryt och dölj formulär
  document.getElementById('cancelAddStudentBtn').addEventListener('click', () => {
    document.getElementById('add-student-form').hidden = true;
  });

  // Spara ny student
  document.getElementById('saveStudentBtn').addEventListener('click', async () => {
    const feedback = document.getElementById('add-student-feedback');
    feedback.innerHTML = '';

    // Hämta formulärvärden
    const name     = document.getElementById('studentName').value.trim();
    const email    = document.getElementById('studentEmail').value.trim();
    const phone    = document.getElementById('studentPhone').value.trim();
    const address  = document.getElementById('studentAddress').value.trim();
    const password = document.getElementById('studentPassword').value;

    // Validera alla fält
    let valid = true;
    const nv  = validateRequired(name, 'Namn');
    if (!nv.valid)  { document.getElementById('err-sName').textContent     = nv.message;  valid = false; }
    const ev  = validateEmail(email);
    if (!ev.valid)  { document.getElementById('err-sEmail').textContent    = ev.message;  valid = false; }
    const phv = validatePhone(phone);
    if (!phv.valid) { document.getElementById('err-sPhone').textContent    = phv.message; valid = false; }
    const av  = validateRequired(address, 'Faktureringsadress');
    if (!av.valid)  { document.getElementById('err-sAddress').textContent  = av.message;  valid = false; }
    const pwv = validatePassword(password);
    if (!pwv.valid) { document.getElementById('err-sPassword').textContent = pwv.message; valid = false; }
    if (!valid) return;

    try {
      // Skapa ny student med standardvärden
      await createStudent({
        id: generateId(), name, email, password, phone, address,
        joinedDate: new Date().toISOString().split('T')[0],
        xpPoints: 0, interests: [], learningFocus: null, subscriptionActive: false,
      });
      showAlert(feedback, 'Studenten har lagts till!');
      document.getElementById('add-student-form').hidden = true;
      await loadStudents();
    } catch {
      showAlert(feedback, 'Kunde inte spara studenten.', 'error');
    }
  });
};