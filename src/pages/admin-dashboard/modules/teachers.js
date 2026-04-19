import { getAllTeachers, createTeacher, deleteTeacher } from '../../../services/teacherService.js';
import { areaLabel } from '../../../utils/formatters.js';
import { validateRequired, validateEmail } from '../../../utils/validators.js';
import { showAlert, showError } from '../../../utils/dom.js';

// Ladda och visa alla lärare i en tabell
export const loadTeachers = async () => {
  const el = document.getElementById('teachers-content');
  try {
    const teachers = await getAllTeachers();
    el.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>Namn</th><th>E-post</th><th>Specialisering</th><th>Åtgärd</th>
          </tr></thead>
          <tbody>
            ${teachers.map(t => `<tr>
              <td><strong>${t.name}</strong></td>
              <td>${t.email}</td>
              <td>${areaLabel(t.specialization)}</td>
              <td>
                <button class="btn btn-danger btn-sm delete-teacher-btn" data-id="${t.id}">
                  Ta bort
                </button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    // Hantera ta bort-knappar
    document.querySelectorAll('.delete-teacher-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Är du säker på att du vill ta bort denna lärare?')) return;
        try { await deleteTeacher(btn.dataset.id); await loadTeachers(); }
        catch { alert('Kunde inte ta bort läraren.'); }
      });
    });
  } catch {
    showError(el, 'Kunde inte ladda lärare.');
  }
};

// Initiera formulärhanterare för lägg till lärare
export const initTeachers = () => {

  // Visa/dölj formulär för ny lärare
  document.getElementById('showAddTeacherBtn').addEventListener('click', () => {
    const form = document.getElementById('add-teacher-form');
    form.hidden = !form.hidden;
  });

  // Avbryt och dölj formulär
  document.getElementById('cancelAddTeacherBtn').addEventListener('click', () => {
    document.getElementById('add-teacher-form').hidden = true;
  });

  // Spara ny lärare
  document.getElementById('saveTeacherBtn').addEventListener('click', async () => {
    const feedback = document.getElementById('add-teacher-feedback');
    feedback.innerHTML = '';

    // Hämta formulärvärden
    const name  = document.getElementById('teacherName').value.trim();
    const email = document.getElementById('teacherEmail').value.trim();
    const spec  = document.getElementById('teacherSpec').value;
    const bio   = document.getElementById('teacherBio').value.trim();

    // Validera obligatoriska fält
    let valid = true;
    const nv = validateRequired(name, 'Namn');
    if (!nv.valid) { document.getElementById('err-tName').textContent  = nv.message; valid = false; }
    const ev = validateEmail(email);
    if (!ev.valid) { document.getElementById('err-tEmail').textContent = ev.message; valid = false; }
    if (!valid) return;

    try {
      // Skapa ny lärare — ID genereras i teacherService
      await createTeacher({ name, email, specialization: spec, bio, imageUrl: '', courses: [] });
      showAlert(feedback, 'Läraren har lagts till!');
      document.getElementById('add-teacher-form').hidden = true;
      await loadTeachers();
    } catch {
      showAlert(feedback, 'Kunde inte spara läraren.', 'error');
    }
  });
};