import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { getAllCourses } from '../../services/courseService.js';
import { courseCardHtml } from '../../components/courseCard.js';
import { showError } from '../../utils/dom.js';

renderNavbar();
renderFooter();

// Ladda de 3 kurser med högst genomsnittsbetyg
const loadFeaturedCourses = async () => {
  const grid = document.getElementById('featured-courses');
  try {
    const courses = await getAllCourses();
    const sorted  = courses
      .filter(c => c.type !== 'ondemand')
      .map(c => ({
        ...c,
        avg: c.ratings.length ? c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length : 0,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);
    grid.innerHTML = sorted.map(c => courseCardHtml(c, './')).join('');
  } catch {
    showError(grid, 'Kunde inte ladda kurser. Kontrollera att json-server körs på port 3000.');
  }
};

// Initiera startsidan
loadFeaturedCourses();