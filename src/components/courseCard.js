import { formatPrice, formatDate, starsHtml, areaLabel, typeLabel } from '../utils/formatters.js';

// Bygg HTML för ett kurskort
export const courseCardHtml = (course, basePath = './', showSubscriptionPrice = false) => {
  const url = `${basePath}pages/course-details/course-details.html?id=${course.id}`;
  return `
  <article class="course-card" aria-label="${course.title}">
    <img
      src="${course.imageUrl}"
      alt="${course.title}"
      loading="lazy"
      onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'"
    />
    <div class="course-card-body">
      <span class="badge badge-${course.area}">${areaLabel(course.area)}</span>
      <h3>${course.title}</h3>
      <p class="course-meta">
        ${course.courseNumber} &nbsp;·&nbsp;
        ${course.days} dagar &nbsp;·&nbsp;
        ${typeLabel(course.type)}
      </p>
      <p>${starsHtml(course.ratings)} &nbsp;·&nbsp; ${formatDate(course.plannedDate)}</p>
      <div class="course-card-footer">
        ${showSubscriptionPrice
  ? `<span style="text-decoration:line-through;color:var(--text-secondary);font-size:0.9rem;">${formatPrice(course.price)}</span>
     <strong style="color:var(--primary);margin-left:6px;">299 kr/mån</strong>`
  : `<strong>${formatPrice(course.price)}</strong>`}
        <a href="${url}" class="btn btn-primary btn-sm">Läs mer</a>
      </div>
    </div>
  </article>
  `;
};