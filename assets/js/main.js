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

  // ===== Demo-"Video" auf der Learn-More-Seite =====
  const demo = document.querySelector('[data-demo]');
  if (demo) {
    const canvas = demo.querySelector('.demo-canvas');
    const dnav = demo.querySelector('.demo-nav');
    const dlist = dnav ? dnav.querySelector('ul') : null;
    const items = dnav ? Array.from(dnav.querySelectorAll('li span')) : [];
    const dUnderline = dnav ? dnav.querySelector('.demo-underline') : null;
    const cursor = demo.querySelector('.cursor');

    const posUnder = (el) => {
      if (!dUnderline || !dlist || !el) return;
      const r = el.getBoundingClientRect();
      const pr = dlist.getBoundingClientRect();
      dUnderline.style.width = `${r.width}px`;
      dUnderline.style.transform = `translateX(${r.left - pr.left}px)`;
    };

    const moveCursor = (el) => {
      if (!cursor || !canvas || !el) return;
      const r = el.getBoundingClientRect();
      const pr = canvas.getBoundingClientRect();
      const x = r.left - pr.left + r.width / 2;
      const y = r.top - pr.top + r.height / 1.2;
      cursor.style.opacity = '1';
      cursor.style.transform = `translate(${x}px, ${y}px) rotate(-15deg)`;
    };

    let i = 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = prefersReduced ? 2800 : 1600;

    // FEHLTE ZUVOR: Schritt-Funktion für die Demo-Animation
    const step = () => {
      const el = items.length ? items[i % items.length] : null;
      items.forEach(s => s.classList.remove('hover'));
      if (el) {
        el.classList.add('hover');
        posUnder(el);
        moveCursor(el);
      }
      i++;
    };

    const startDemo = () => {
      step();
      demo.dataset.running = 'true';
      if (demo._timer) clearInterval(demo._timer);
      demo._timer = setInterval(step, intervalMs);
    };

    // etwas Luft lassen, bis Layout/Schriften stabil sind
    window.setTimeout(() => {
      // einmal initial positionieren, dann Intervall starten
      step();
      startDemo();
    }, 300);

    // optional: pausieren beim Hover, fortsetzen beim Verlassen
    demo.addEventListener('mouseenter', () => {
      if (demo._timer) { clearInterval(demo._timer); demo._timer = null; }
    });
    demo.addEventListener('mouseleave', () => {
      if (!demo._timer) demo._timer = setInterval(step, intervalMs);
    });

    // bei Resize neu justieren
    window.addEventListener('resize', () => {
      const currentEl = items.length ? items[(i - 1 + items.length) % items.length] : null;
      if (currentEl) {
        posUnder(currentEl);
        moveCursor(currentEl);
      }
    });
  }
})();
