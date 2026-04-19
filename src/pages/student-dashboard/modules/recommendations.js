// Importerar den kompilerade TypeScript-motorn — detta är kärnan i rekommendationssystemet
import { recommendCourses } from '../../../ts/dist/ts/recommendationEngine.js';
import { getAllCourses } from '../../../services/courseService.js';
import { getBookingsByStudent } from '../../../services/bookingService.js';
import { formatPrice, areaLabel } from '../../../utils/formatters.js';
import { showError } from '../../../utils/dom.js';

export const loadRecommendations = async (student, emptyStateHtml) => {
  const el = document.getElementById('recommendations-content');
  try {
    const [allCourses, bookings] = await Promise.all([
      getAllCourses(),
      getBookingsByStudent(student.id),
    ]);

    const enrolledIds    = bookings.map(b => b.courseId);
    const interests      = student.interests || [];
    const completedAreas = [...new Set(
      bookings
        .filter(b => b.status === 'confirmed')
        .map(b => allCourses.find(c => c.id === b.courseId)?.area)
        .filter(Boolean)
    )];

    // Använder TypeScript-motorn för att beräkna rekommendationer
    const recs = recommendCourses(allCourses, {
      studentId:         student.id,
      enrolledCourseIds: enrolledIds,
      previousEducation: '',
      interests,
      completedAreas,
    });

    el.innerHTML = recs.length === 0
      ? emptyStateHtml('', 'Inga rekommendationer just nu', 'Boka fler kurser för att få personliga rekommendationer.', '../courses/courses.html')
      : `<p class="section-title">Rekommenderade kurser för dig</p>
         <p style="color:var(--text-secondary);margin-bottom:24px;font-size:0.875rem;">
           Baserat på dina intressen och tidigare kurser — beräknat av TypeScript-motorn
         </p>
         ${recs.map(r => `
           <div class="booking-item">
             <div class="booking-item-info">
               <h3>${r.course.title}</h3>
               <p>${areaLabel(r.course.area)} &nbsp;·&nbsp; ${r.course.days} dagar &nbsp;·&nbsp; ${r.reason}</p>
               <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">
                 Relevansscore: ${r.relevanceScore} poäng
               </p>
             </div>
             <div class="booking-item-meta">
               <strong>${formatPrice(r.course.price)}</strong>
               <a href="../course-details/course-details.html?id=${r.course.id}"
                  class="btn btn-primary btn-sm">Läs mer</a>
             </div>
           </div>`).join('')}`;
  } catch {
    showError(el, 'Kunde inte ladda rekommendationer.');
  }
};