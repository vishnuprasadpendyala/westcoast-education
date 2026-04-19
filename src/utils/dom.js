// Hämta URL-parameter med angiven nyckel
export const getParam = (key) =>
  new URLSearchParams(window.location.search).get(key);

// Visa felmeddelande i ett HTML-element
export const showError = (el, msg) => {
  if (!el) return;
  el.innerHTML = `<p class="error-msg">${msg}</p>`;
};

// Visa alertmeddelande i ett HTML-element
export const showAlert = (el, msg, type = 'success') => {
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
};

// Visa spinner/laddningsindikator i ett HTML-element
export const showSpinner = (el) => {
  if (!el) return;
  el.innerHTML = `<div class="loading-container"><div class="spinner"></div></div>`;
};