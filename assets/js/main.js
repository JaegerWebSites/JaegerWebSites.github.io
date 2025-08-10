/*
  Navigation: aktiver Link + animierter Underline-Indicator
  Mobile-Menü: Toggle
  Kleinigkeiten: dynamisches Jahr
*/

(function() {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const list = nav ? nav.querySelector('ul') : null;
  const underline = nav ? nav.querySelector('.nav-underline') : null;
  const links = nav ? Array.from(nav.querySelectorAll('[data-nav-link]')) : [];
  const toggle = document.querySelector('[data-toggle]');

  // aktives Jahr im Footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Helper: aktueller Dateiname
  const getFile = (path) => {
    const f = (path.split('/').pop() || '').toLowerCase();
    return f || 'index.html';
  };

  // aktiven Link ermitteln
  const current = getFile(window.location.pathname);
  let activeLink = links.find(a => (a.getAttribute('href') || '').toLowerCase().endsWith(current));
  if (!activeLink) activeLink = links[0];
  if (activeLink) {
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');
  }

  // Underline positionieren
  const positionUnderline = (el) => {
    if (!underline || !list || !el) return;
    const r = el.getBoundingClientRect();
    const pr = list.getBoundingClientRect();
    underline.style.opacity = '1';
    underline.style.width = `${r.width}px`;
    underline.style.transform = `translateX(${r.left - pr.left}px)`;
  };

  // initiale Position
  window.requestAnimationFrame(() => positionUnderline(activeLink));

  // Hover-/Focus-Bewegung
  links.forEach(link => {
    link.addEventListener('mouseenter', () => positionUnderline(link));
    link.addEventListener('focus', () => positionUnderline(link));
  });
  if (nav) {
    nav.addEventListener('mouseleave', () => positionUnderline(activeLink));
  }
  window.addEventListener('resize', () => positionUnderline(activeLink));

  // Mobile Toggle
  if (toggle && header) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      // nach dem Öffnen neu positionieren
      window.requestAnimationFrame(() => positionUnderline(activeLink));
    });
  }
})();
