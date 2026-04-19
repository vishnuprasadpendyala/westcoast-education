import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { loginAdmin } from '../../services/authService.js';
import { validateEmail, validatePassword } from '../../utils/validators.js';
import { showAlert } from '../../utils/dom.js';

renderNavbar();
renderFooter();

// Password toggle
document.querySelectorAll('.toggle-pwd').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = '👁';
  });
});

// Login
document.getElementById('adminLoginBtn').addEventListener('click', async () => {
  document.getElementById('err-aEmail').textContent = '';
  document.getElementById('err-aPassword').textContent = '';
  const feedback = document.getElementById('admin-login-feedback');
  feedback.innerHTML = '';

  const email    = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  let valid = true;
  const ev = validateEmail(email);
  if (!ev.valid) {
    document.getElementById('err-aEmail').textContent = ev.message;
    valid = false;
  }
  const pv = validatePassword(password);
  if (!pv.valid) {
    document.getElementById('err-aPassword').textContent = pv.message;
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('adminLoginBtn');
  btn.disabled = true;
  btn.textContent = 'Loggar in...';

  try {
    await loginAdmin(email, password);
    showAlert(feedback, '✅ Inloggning lyckades! Omdirigerar...');
    setTimeout(() => {
      location.href = '../admin-dashboard/admin-dashboard.html';
    }, 800);
  } catch (err) {
    showAlert(feedback, err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Logga in som admin';
  }
});