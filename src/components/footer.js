
export const renderFooter = () => {
 
  const parts = window.location.pathname.split('/').filter(p => p && p !== '');
  const root  = parts.length <= 1 ? './' : '../'.repeat(parts.length - 1);

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">

        <!-- Varumärkessektion med logotyp och beskrivning -->
        <div class="footer-brand">
          <span class="nav-logo">Westcoast <span>Education</span></span>
          <p>Nordens ledande utbildningsplattform inom IT med fokus på framväxande teknologier.</p>
        </div>

        <!-- Om oss-länkar -->
        <div class="footer-col">
          <h4>Om oss</h4>
          <a href="${root}pages/contact/contact.html">Kontakta oss</a>
          <a href="${root}index.html">Om Westcoast</a>
        </div>

        <!-- Kurslänkar -->
        <div class="footer-col">
          <h4>Kurser</h4>
          <a href="${root}pages/courses/courses.html">Alla kurser</a>
          <a href="${root}pages/ondemand/ondemand.html">On-demand</a>
        </div>

        <!-- Kontolänkar för inloggning och registrering -->
        <div class="footer-col">
          <h4>Konto</h4>
          <a href="${root}pages/student-login/student-login.html">Logga in</a>
          <a href="${root}pages/admin-login/admin-login.html">Admin</a>
        </div>

      </div>

      <!-- Sidfotens nedre del med upphovsrättsinformation -->
      <div class="footer-bottom">
        <span>© 2026 Westcoast Education. Alla rättigheter förbehållna.</span>
      </div>
    </div>
  `;

  
  document.querySelector('footer')?.replaceWith(footer);
};