import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { getAllCourses } from '../../services/courseService.js';
import { courseCardHtml } from '../../components/courseCard.js';
import { showError, getParam } from '../../utils/dom.js';

renderNavbar();
renderFooter();

// Lagra alla kurser globalt för filtrering
let allCourses = [];

// Rendera kurskort i rutnätet
const renderCourses = (courses) => {
  const grid  = document.getElementById('courses-grid');
  const count = document.getElementById('results-count');

  if (courses.length === 0) {
    grid.innerHTML = '<p class="error-msg">Inga kurser hittades.</p>';
    count.textContent = '';
    return;
  }

  count.textContent = `Visar ${courses.length} kurs${courses.length !== 1 ? 'er' : ''}`;
  grid.innerHTML = courses.map(c => courseCardHtml(c, '../../')).join('');
};

// Sätt upp dropdown-filter för kursområden
const setupFilters = () => {
  const btn   = document.getElementById('filterDropdownBtn');
  const menu  = document.getElementById('filterDropdownMenu');
  const label = document.getElementById('filterLabel');

  // Öppna/stäng dropdown
  btn.addEventListener('click', () => {
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    btn.classList.toggle('open', !isOpen);
  });

  // Stäng dropdown vid klick utanför
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.hidden = true;
      btn.classList.remove('open');
    }
  });

  // Hantera val av filteralternativ
  document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      label.textContent = option.textContent.trim();
      menu.hidden = true;
      btn.classList.remove('open');

      const area = option.dataset.area;
      renderCourses(area === 'all' ? allCourses : allCourses.filter(c => c.area === area));
    });
  });
};

// Initiera kurssidan
const init = async () => {
  const grid = document.getElementById('courses-grid');
  try {
    const courses = await getAllCourses();

    // Filtrera bort on-demand kurser — dessa visas på en separat sida
    allCourses = courses.filter(c => c.type !== 'ondemand');

    // Kolla om ett område skickades via URL t.ex. ?area=web3
    const area = getParam('area');
    if (area) {
      const match = document.querySelector(`.filter-option[data-area="${area}"]`);
      if (match) {
        document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('active'));
        match.classList.add('active');
        document.getElementById('filterLabel').textContent = match.textContent.trim();
      }
      renderCourses(allCourses.filter(c => c.area === area));
    } else {
      renderCourses(allCourses);
    }

    setupFilters();
  } catch {
    showError(grid, 'Kunde inte ladda kurser. Kontrollera att json-server körs på port 3000.');
  }
};

init();