import { renderNavbar } from "../../components/navbar.js";
import { renderFooter } from "../../components/footer.js";
import { getAllCourses } from "../../services/courseService.js";
import { getBookingsByStudent, createBooking } from "../../services/bookingService.js";
import { createNotification } from "../../services/notificationService.js";
import { sendPurchaseRecommendation } from "../../services/messageService.js";
import { formatPrice } from '../../utils/formatters.js';
import { courseCardHtml } from '../../components/courseCard.js';
import { getStudent, saveStudent } from "../../utils/storage.js";
import { showAlert, showError } from "../../utils/dom.js";
import ApiClient from "../../data/apiClient.js";

renderNavbar();
renderFooter();

const studentClient = new ApiClient("students");
const student = getStudent();

// Prenumerationsbanner
const renderSubscriptionCard = async () => {
  const el = document.getElementById("subscription-card");
  const isActive = student?.subscriptionActive === true;

  if (!student) {
    el.innerHTML = `
      <div class="sub-banner">
        <div class="sub-banner-info">
          <h3>Omedelbar och Obegränsad tillgång</h3>
        </div>
        <div class="sub-banner-price">299 <span>kr/mån</span></div>
        <a href="../student-login/student-login.html" class="btn btn-primary">
          Logga in för att prenumerera
        </a>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="sub-banner ${isActive ? "sub-banner-active" : ""}">
      <div class="sub-banner-info">
        <h3>${isActive ? "Din prenumeration är aktiv" : "Obegränsad tillgång till alla on-demand kurser"}</h3>
        <p>${isActive ? "Du har tillgång till alla on-demand kurser." : "Alla kurser, ny kurs varje månad, avsluta när som helst."}</p>
      </div>
      <div class="sub-banner-price">299 <span>kr/mån</span></div>
      <div>
        <div id="sub-feedback"></div>
        <button class="btn ${isActive ? "btn-ghost" : "btn-primary"}" id="subToggleBtn">
          ${isActive ? "Avsluta prenumeration" : "Starta prenumeration"}
        </button>
      </div>
    </div>`;

  document.getElementById("subToggleBtn")?.addEventListener("click", async () => {
    const fb  = document.getElementById("sub-feedback");
    const btn = document.getElementById("subToggleBtn");
    btn.disabled = true;
    try {
      const newStatus = !student.subscriptionActive;
      await studentClient.update(student.id, { subscriptionActive: newStatus });
      const updated = { ...student, subscriptionActive: newStatus };
      saveStudent(updated);
      fb.innerHTML = newStatus
        ? '<div class="alert alert-success" style="margin-top:8px;">Prenumeration aktiverad!</div>'
        : '<div class="alert alert-error" style="margin-top:8px;">Prenumeration avslutad.</div>';
      setTimeout(() => renderSubscriptionCard(), 1200);
    } catch {
      fb.innerHTML = '<div class="alert alert-error" style="margin-top:8px;">Något gick fel. Försök igen.</div>';
      btn.disabled = false;
    }
  });
};

// --- Rendera on-demand kurser
const renderOndemandCourses = async () => {
  const grid  = document.getElementById("ondemand-grid");
  const count = document.getElementById("ondemand-count");

  try {
    const allCourses      = await getAllCourses();
    const ondemandCourses = allCourses.filter(c => c.type === "ondemand");

    document.getElementById("totalOndemand").textContent = ondemandCourses.length;
    count.textContent = `Visar ${ondemandCourses.length} on-demand kurs${ondemandCourses.length !== 1 ? "er" : ""}`;

    if (ondemandCourses.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <h3>Inga on-demand kurser ännu</h3>
          <p>Kom tillbaka snart — vi lägger till kurser löpande.</p>
        </div>`;
      return;
    }

    // Hämta studentens köpta kurser
    let purchasedIds   = [];
    const isSubscriber = student?.subscriptionActive === true;

    if (student) {
      try {
        const bookings = await getBookingsByStudent(student.id);
        purchasedIds   = bookings.map(b => b.courseId);
      } catch { /* ignorera fel vid hämtning */ }
    }

    // Bygg kurskort med delade courseCardHtml-komponenten
    grid.innerHTML = ondemandCourses.map(c => {
  const isPurchased = purchasedIds.includes(c.id) || isSubscriber;
  return `
    <div class="course-card-wrapper" style="position:relative;display:flex;flex-direction:column;">
      ${courseCardHtml(c, '../../', true)}
      ${isPurchased ? `<span class="ondemand-owned" style="position:absolute;top:12px;right:12px;">Köpt</span>` : ''}
      <div style="padding:0 16px 16px;margin-top:auto;">
        
        ${isPurchased
          ? `<button class="btn btn-ghost btn-sm" style="width:100%;" disabled>Köpt</button>`
          : student
            ? `<button class="btn btn-primary btn-sm buy-btn" style="width:100%;"
                data-id="${c.id}"
                data-title="${c.title}"
                data-price="${c.price}"
                data-area="${c.area}">
                ${isSubscriber ? "Starta kurs" : "Logga in för att köpa"}
              </button>`
            : `<a href="../student-login/student-login.html" class="btn btn-primary btn-sm" style="width:100%;text-align:center;display:block;">
                Logga in för att köpa
              </a>`}
      </div>
      <div id="feedback-${c.id}"></div>
    </div>`;
}).join('');

    // Hantera köpknappar
    document.querySelectorAll(".buy-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const courseId    = btn.dataset.id;
        const courseTitle = btn.dataset.title;
        const coursePrice = parseInt(btn.dataset.price);
        const courseArea  = btn.dataset.area;
        const fb          = document.getElementById(`feedback-${courseId}`);

        btn.disabled    = true;
        btn.textContent = "Köper...";

        try {
          await createBooking(student.id, courseId, "ondemand", coursePrice, {
            name:    student.name,
            email:   student.email,
            phone:   student.phone || "",
            address: student.address || "",
          });

          await createNotification(
            student.id,
            `Du har köpt on-demand kursen "${courseTitle}". Tillgång är direkt tillgänglig.`,
            "purchase"
          );

          const courses = await getAllCourses();
          await sendPurchaseRecommendation(
            student.id, courseTitle, courseArea,
            courses.filter(c => c.id !== courseId)
          );

          fb.innerHTML = `
            <div class="alert alert-success" style="margin-top:8px;">
              Köpt! Kolla dina
              <a href="../student-dashboard/student-dashboard.html">Meddelanden</a>
              för rekommendationer.
            </div>`;
          btn.textContent = "Köpt!";
          setTimeout(() => renderOndemandCourses(), 1500);
        } catch (err) {
          fb.innerHTML = `<div class="alert alert-error" style="margin-top:8px;">Köpet misslyckades: ${err.message}</div>`;
          btn.disabled    = false;
          btn.textContent = `Köp – ${formatPrice(coursePrice)}`;
        }
      });
    });

  } catch {
    showError(grid, "Kunde inte ladda kurser. Kontrollera att json-server körs.");
  }
};

// Initiera sidan
renderSubscriptionCard();
renderOndemandCourses();