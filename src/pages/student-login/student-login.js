import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { loginStudent, registerStudent } from '../../services/authService.js';
import { validateEmail, validatePassword, validatePasswordMatch, validatePhone, validateRequired } from '../../utils/validators.js';
import { showAlert } from '../../utils/dom.js';

renderNavbar();
renderFooter();

// --- Flikväxling mellan inloggning och registrering ---
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
  });
});

// --- Visa/dölj lösenord ---
document.querySelectorAll('.toggle-pwd').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const show  = input.type === 'password';
    input.type  = show ? 'text' : 'password';
    btn.textContent = '👁';
  });
});

// --- Hjälpfunktioner för felmeddelanden ---
const clearErrors = (...ids) =>
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });

const setError = (id, msg) => {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
};

// --- Inloggning ---
document.getElementById('loginBtn').addEventListener('click', async () => {
  clearErrors('err-email', 'err-password');
  const feedback = document.getElementById('login-feedback');
  feedback.innerHTML = '';

  // Hämta formulärvärden
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Validera fält
  let valid = true;
  const ev = validateEmail(email);
  if (!ev.valid) { setError('err-email', ev.message); valid = false; }
  const pv = validatePassword(password);
  if (!pv.valid) { setError('err-password', pv.message); valid = false; }
  if (!valid) return;

  // Inaktivera knappen under inloggning
  const btn = document.getElementById('loginBtn');
  btn.disabled    = true;
  btn.textContent = 'Loggar in...';

  try {
    await loginStudent(email, password);
    showAlert(feedback, 'Inloggning lyckades! Omdirigerar...');
    setTimeout(() => {
      location.href = '../student-dashboard/student-dashboard.html';
    }, 800);
  } catch (err) {
    showAlert(feedback, err.message, 'error');
    btn.disabled    = false;
    btn.textContent = 'Logga in';
  }
});

// --- Registrering ---
document.getElementById('registerBtn').addEventListener('click', async () => {
  clearErrors('err-regName', 'err-regEmail', 'err-regPhone', 'err-regAddress', 'err-regPassword', 'err-regConfirm');
  const feedback = document.getElementById('register-feedback');
  feedback.innerHTML = '';

  // Hämta formulärvärden
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const address  = document.getElementById('regAddress').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;

  // Validera alla fält
  let valid = true;
  const nv  = validateRequired(name, 'Namn');
  if (!nv.valid)  { setError('err-regName',     nv.message);  valid = false; }
  const ev  = validateEmail(email);
  if (!ev.valid)  { setError('err-regEmail',    ev.message);  valid = false; }
  const phv = validatePhone(phone);
  if (!phv.valid) { setError('err-regPhone',    phv.message); valid = false; }
  const av  = validateRequired(address, 'Faktureringsadress');
  if (!av.valid)  { setError('err-regAddress',  av.message);  valid = false; }
  const pwv = validatePassword(password);
  if (!pwv.valid) { setError('err-regPassword', pwv.message); valid = false; }
  const cmv = validatePasswordMatch(password, confirm);
  if (!cmv.valid) { setError('err-regConfirm',  cmv.message); valid = false; }
  if (!valid) return;

  // Inaktivera knappen under registrering
  const btn = document.getElementById('registerBtn');
  btn.disabled    = true;
  btn.textContent = 'Skapar konto...';

  try {
    await registerStudent(name, email, password, phone, address);
    showAlert(feedback, 'Konto skapat! Omdirigerar...');
    setTimeout(() => {
      location.href = '../student-dashboard/student-dashboard.html';
    }, 800);
  } catch (err) {
    showAlert(feedback, err.message, 'error');
    btn.disabled    = false;
    btn.textContent = 'Skapa konto';
  }
});