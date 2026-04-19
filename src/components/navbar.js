
import { getStudent, getAdmin } from "../utils/storage.js";

// Beräkna relativ rotsökväg beroende på var sidan befinner sig
const getRoot = () => {
  const parts = window.location.pathname
    .split("/")
    .filter((p) => p && p !== "");
  if (parts.length <= 1) return "./";
  return "../".repeat(parts.length - 1);
};

// Bygg och rendera navigeringsfältet
export const renderNavbar = () => {
  const root = getRoot();
  const student = getStudent();
  const admin = getAdmin();

  // Visa rätt knappar beroende på inloggningsstatus
  const loginLinks = admin
    ? `<a href="${root}pages/admin-dashboard/admin-dashboard.html" class="btn btn-primary btn-sm">Admin-panel</a>`
    : student
      ? `<a href="${root}pages/student-dashboard/student-dashboard.html" class="btn btn-primary btn-sm">Min sida</a>`
      : `<a href="${root}pages/student-login/student-login.html" class="btn btn-outline btn-sm">Logga in</a>
       <a href="${root}pages/admin-login/admin-login.html" class="btn btn-ghost btn-sm">Admin</a>`;

  // Skapa nav-elementet
  const navbar = document.createElement("nav");
  navbar.className = "navbar";
  navbar.setAttribute("aria-label", "Huvudnavigation");
  navbar.innerHTML = `
    <div class="nav-inner">

      <!-- Logotyp och länk till startsidan -->
      <a href="${root}index.html" class="nav-logo" aria-label="Westcoast Education – Till startsidan">
        Westcoast <span>Education</span>
      </a>

      <!-- Hamburgerknapp för mobil -->
      <button class="hamburger" aria-expanded="false" aria-controls="nav-list" aria-label="Öppna meny">
        <span></span><span></span><span></span>
      </button>

      <ul class="nav-list" id="nav-list" role="list">

        <!-- Hemlänk -->
        <li class="nav-item">
          <a href="${root}index.html" class="nav-link">Hem</a>
        </li>

        

        <!-- Länk till alla kurser -->
        <li class="nav-item">
          <a href="${root}pages/courses/courses.html" class="nav-link">Alla kurser</a>
        </li>

        <!-- On-demand (#22-24) -->
        <li class="nav-item">
          <a href="${root}pages/ondemand/ondemand.html" class="nav-link">
            On-demand
          </a>
        </li>

        <!-- Kontaktsida -->
        <li class="nav-item">
          <a href="${root}pages/contact/contact.html" class="nav-link">Kontakt</a>
        </li>
      </ul>

      <!-- Inloggnings- och registreringsknappar -->
      <div class="nav-cta">${loginLinks}</div>
    </div>
  `;

  // Ersätt det befintliga header-elementet med navbar
  document.querySelector("header")?.replaceWith(navbar);

  // Initiera dropdown- och hamburgerfunktioner
  setupDropdowns(navbar);
  setupHamburger(navbar);
};

// Hantera öppning och stängning av dropdownmenyer
const setupDropdowns = (navbar) => {
  // Stäng alla öppna dropdowns
  const closeAll = () => {
    navbar.querySelectorAll('[aria-expanded="true"]').forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      document
        .getElementById(b.getAttribute("aria-controls"))
        ?.classList.remove("open");
    });
  };

  // Växla dropdown vid klick
  navbar.querySelectorAll("[aria-haspopup]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      closeAll();
      if (!isExpanded) {
        btn.setAttribute("aria-expanded", "true");
        document
          .getElementById(btn.getAttribute("aria-controls"))
          ?.classList.add("open");
      }
    });
  });

  // Stäng dropdown med Escape-tangenten
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  // Stäng dropdown vid klick utanför menyn
  document.addEventListener("click", closeAll);
};

// Hantera hamburgermenyn för mobila enheter
const setupHamburger = (navbar) => {
  const btn = navbar.querySelector(".hamburger");
  const list = navbar.querySelector(".nav-list");

  // Växla mobilmeny vid klick
  btn?.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Stäng meny" : "Öppna meny");
  });

  // Stäng mobilmeny med Escape-tangenten
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && list.classList.contains("open")) {
      list.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Öppna meny");
      btn.focus();
    }
  });
};
