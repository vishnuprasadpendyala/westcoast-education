import { getAllCourses, createCourse, deleteCourse, updateCourse, groupByArea } from '../../../services/courseService.js';
import { getAllTeachers } from '../../../services/teacherService.js';
import { formatPrice, formatDate, areaLabel, generateId } from '../../../utils/formatters.js';
import { validateRequired } from '../../../utils/validators.js';
import { showAlert, showError } from '../../../utils/dom.js';

// Ladda och visa alla kurser grupperade per område
export const loadCourses = async () => {
  const el = document.getElementById('courses-content');
  try {
    const [courses, teachers] = await Promise.all([getAllCourses(), getAllTeachers()]);

    // Gruppera kurser per område via delad hjälpfunktion
    const grouped = groupByArea(courses);

    el.innerHTML = Object.entries(grouped).map(([area, list]) => `
      <div class="course-group">
        <div class="course-group-header">${areaLabel(area)} (${list.length})</div>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Titel</th><th>Kursnummer</th><th>Dagar</th>
              <th>Pris</th><th>Startdatum</th><th>Lärare</th><th>Åtgärd</th>
            </tr></thead>
            <tbody>
              ${list.map(c => {
                const teacher = teachers.find(t => t.id === c.teacher);
                return `<tr>
                  <td><strong>${c.title}</strong></td>
                  <td>${c.courseNumber}</td>
                  <td>${c.days} dagar</td>
                  <td>${formatPrice(c.price)}</td>
                  <td>${formatDate(c.plannedDate)}</td>
                  <td>${teacher ? teacher.name : '–'}</td>
                  <td>
                    <div class="action-btns">
                      <button class="btn btn-outline btn-sm edit-course-btn"
                        data-id="${c.id}"
                        data-date="${c.plannedDate}"
                        data-teacher="${c.teacher || ''}">
                        Redigera
                      </button>
                      <button class="btn btn-danger btn-sm delete-course-btn"
                        data-id="${c.id}">
                        Ta bort
                      </button>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`).join('');

    // Hantera ta bort-knappar
    document.querySelectorAll('.delete-course-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Är du säker på att du vill ta bort denna kurs?')) return;
        try { await deleteCourse(btn.dataset.id); await loadCourses(); }
        catch { alert('Kunde inte ta bort kursen.'); }
      });
    });

    // Hantera redigera-knappar — fyll i redigeringsformuläret
    document.querySelectorAll('.edit-course-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const editForm = document.getElementById('edit-course-form');
        document.getElementById('editCourseId').value    = btn.dataset.id;
        document.getElementById('editPlannedDate').value = btn.dataset.date;
        const allTeachers = await getAllTeachers();
        document.getElementById('editCourseTeacher').innerHTML =
          '<option value="">Välj lärare...</option>' +
          allTeachers.map(t =>
            `<option value="${t.id}" ${t.id === btn.dataset.teacher ? 'selected' : ''}>
              ${t.name} (${areaLabel(t.specialization)})
            </option>`).join('');
        editForm.hidden = false;
        editForm.scrollIntoView({ behavior: 'smooth' });
      });
    });
  } catch {
    showError(el, 'Kunde inte ladda kurser.');
  }
};

// Initiera formulärhanterare för lägg till och redigera kurs
export const initCourses = () => {

  // Visa/dölj formulär för ny kurs
  document.getElementById('showAddCourseBtn').addEventListener('click', async () => {
    const form = document.getElementById('add-course-form');
    form.hidden = !form.hidden;
    if (!form.hidden) {
      const teachers = await getAllTeachers();
      document.getElementById('courseTeacher').innerHTML =
        '<option value="">Välj lärare...</option>' +
        teachers.map(t =>
          `<option value="${t.id}">${t.name} (${areaLabel(t.specialization)})</option>`
        ).join('');
    }
  });

  // Avbryt och dölj formulär
  document.getElementById('cancelAddCourseBtn').addEventListener('click', () => {
    document.getElementById('add-course-form').hidden = true;
  });

  // Spara ny kurs
  document.getElementById('saveCourseBtn').addEventListener('click', async () => {
    const feedback = document.getElementById('add-course-feedback');
    feedback.innerHTML = '';

    // Hämta formulärvärden
    const title       = document.getElementById('courseTitle').value.trim();
    const number      = document.getElementById('courseNumber').value.trim();
    const days        = document.getElementById('courseDays').value;
    const price       = document.getElementById('coursePrice').value;
    const area        = document.getElementById('courseArea').value;
    const type        = document.getElementById('courseType').value;
    const plannedDate = document.getElementById('coursePlannedDate').value;
    const imageUrl    = document.getElementById('courseImageUrl').value.trim();
    const description = document.getElementById('courseDescription').value.trim();
    const teacher     = document.getElementById('courseTeacher').value;

    // Validera obligatoriska fält
    let valid = true;
    const tv = validateRequired(title, 'Kurstitel');
    if (!tv.valid) { document.getElementById('err-title').textContent = tv.message; valid = false; }
    const nv = validateRequired(number, 'Kursnummer');
    if (!nv.valid) { document.getElementById('err-number').textContent = nv.message; valid = false; }
    if (!days || days < 1)   { document.getElementById('err-days').textContent  = 'Antal dagar krävs.'; valid = false; }
    if (!price || price < 0) { document.getElementById('err-price').textContent = 'Kostnad krävs.';     valid = false; }
    if (!valid) return;

    try {
      await createCourse({
        id: generateId(), title, courseNumber: number,
        days: parseInt(days), price: parseInt(price),
        area, type, availability: [type],
        plannedDate: plannedDate || new Date().toISOString().split('T')[0],
        imageUrl, description, ratings: [], teacher, tags: [],
      });
      showAlert(feedback, 'Kursen har lagts till!');
      document.getElementById('add-course-form').hidden = true;
      await loadCourses();
    } catch {
      showAlert(feedback, 'Kunde inte spara kursen.', 'error');
    }
  });

  // Spara redigerade kursuppgifter
  document.getElementById('saveEditCourseBtn').addEventListener('click', async () => {
    const feedback = document.getElementById('edit-course-feedback');
    feedback.innerHTML = '';
    const id          = document.getElementById('editCourseId').value;
    const plannedDate = document.getElementById('editPlannedDate').value;
    const teacher     = document.getElementById('editCourseTeacher').value;

    if (!plannedDate) {
      document.getElementById('err-edit-date').textContent = 'Startdatum krävs.';
      return;
    }
    try {
      await updateCourse(id, { plannedDate, teacher });
      showAlert(feedback, 'Kursen har uppdaterats!');
      document.getElementById('edit-course-form').hidden = true;
      await loadCourses();
    } catch {
      showAlert(feedback, 'Kunde inte uppdatera kursen.', 'error');
    }
  });

  // Avbryt redigering
  document.getElementById('cancelEditCourseBtn').addEventListener('click', () => {
    document.getElementById('edit-course-form').hidden = true;
  });
};