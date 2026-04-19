import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { validateRequired, validateEmail } from '../../utils/validators.js';
import { showAlert } from '../../utils/dom.js';
import ApiClient from '../../data/apiClient.js';
import { generateId } from '../../utils/formatters.js';

renderNavbar();
renderFooter();

const contactClient = new ApiClient('contactMessages');

// Sätt felmeddelande för ett specifikt fält
const setError = (id, msg) => {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
};

// Rensa alla felmeddelanden i formuläret
const clearErrors = () => {
  ['err-cName', 'err-cEmail', 'err-cSubject', 'err-cMessage']
    .forEach(id => setError(id, ''));
};

// Hantera formulärinlämning
document.getElementById('sendMessageBtn').addEventListener('click', async () => {
  clearErrors();
  const feedback = document.getElementById('contact-feedback');
  feedback.innerHTML = '';

  // Hämta formulärvärden
  const name    = document.getElementById('contactName').value.trim();
  const email   = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value.trim();

  // Validera alla fält
  let valid = true;
  const nv = validateRequired(name, 'Namn');
  if (!nv.valid) { setError('err-cName', nv.message); valid = false; }
  const ev = validateEmail(email);
  if (!ev.valid) { setError('err-cEmail', ev.message); valid = false; }
  if (!subject) { setError('err-cSubject', 'Välj ett ämne.'); valid = false; }
  const mv = validateRequired(message, 'Meddelande');
  if (!mv.valid) { setError('err-cMessage', mv.message); valid = false; }
  if (!valid) return;

  // Inaktivera knappen under sändning
  const btn = document.getElementById('sendMessageBtn');
  btn.disabled = true;
  btn.textContent = 'Skickar...';

  try {
    // Spara kontaktmeddelandet i databasen
    await contactClient.create({
      id: generateId(),
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    });

    showAlert(feedback, 'Tack för ditt meddelande! Vi återkommer inom 24 timmar.');

    // Rensa formuläret efter skickat meddelande
    document.getElementById('contactName').value    = '';
    document.getElementById('contactEmail').value   = '';
    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';

    btn.textContent = 'Skickat!';
  } catch {
    showAlert(feedback, 'Kunde inte skicka meddelandet. Försök igen.', 'error');
    btn.disabled = false;
    btn.textContent = 'Skicka meddelande';
  }
});