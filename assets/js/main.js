/*
  Navigation: aktiver Link + animierter Underline-Indicator
  Mobile-Menü: Toggle
  Kleinigkeiten: dynamisches Jahr
  + Learn-More: 3D-Carousel mit drei Demo-„Videos“ (Simulation)
*/

document.addEventListener('DOMContentLoaded', () => {
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

  requestAnimationFrame(() => positionUnderline(activeLink));

  links.forEach(link => {
    link.addEventListener('mouseenter', () => positionUnderline(link));
    link.addEventListener('focus', () => positionUnderline(link));
  });
  if (nav) nav.addEventListener('mouseleave', () => positionUnderline(activeLink));
  window.addEventListener('resize', () => positionUnderline(activeLink));

  if (toggle && header) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      requestAnimationFrame(() => positionUnderline(activeLink));
    });
  }

  // ===== Learn-More: 3D-Carousel =====
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const panels = Array.from(carousel.querySelectorAll('.panel'));
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rotTimer = null;
  let idx = 0;
  let rotating = false;

  const applyPositions = () => {
    panels.forEach(p => p.classList.remove('is-front','is-left','is-right'));
    const front = panels[idx % panels.length];
    const right = panels[(idx + 1) % panels.length];
    const left  = panels[(idx + 2) % panels.length];
    if (front) front.classList.add('is-front');
    if (right) right.classList.add('is-right');
    if (left)  left.classList.add('is-left');
  };

  const pauseAll = () => { stopRotation(); panels.forEach(p => p._demoStop && p._demoStop()); };
  const resumeAll = () => { if (!prefersReduced) { startRotation(); panels.forEach(p => p._demoStart && p._demoStart()); } };

  const ROTATE_INTERVAL_MS = 2500; // langsamer
  const PANEL_TRANS_MS = 800; // muss zur CSS transition passen

  const beginRotation = () => {
    if (rotating) return;
    rotating = true;
    carousel.classList.add('is-rotating');
    pauseAll();
  };
  const endRotation = () => {
    rotating = false;
    carousel.classList.remove('is-rotating');
    const recalc = () => {
      panels.forEach(p => {
        if (prefersReduced) {
          p._demoStep && p._demoStep();
        } else {
          p._demoStart && p._demoStart();
        }
      });
    };
    // kurz warten bis die CSS-Transition fertig ist, dann neu berechnen
    requestAnimationFrame(() => requestAnimationFrame(recalc));
  };

  const rotateOnce = () => {
    beginRotation();
    idx = (idx + 1) % panels.length;
    applyPositions();
    setTimeout(endRotation, PANEL_TRANS_MS + 120);
  };

  const startRotation = () => {
    stopRotation();
    rotTimer = setInterval(rotateOnce, ROTATE_INTERVAL_MS);
  };
  const stopRotation = () => { if (rotTimer) { clearInterval(rotTimer); rotTimer = null; } };

  // Demo-Hover in jedem Panel simulieren
  const attachDemo = (panel, speedMs) => {
    const dnav = panel.querySelector('.demo-nav');
    const list = dnav ? dnav.querySelector('ul') : null;
    const items = dnav ? Array.from(dnav.querySelectorAll('li span')) : [];
    const u = dnav ? dnav.querySelector('.demo-underline') : null;
    let j = 0; let timer = null;

    const pos = (el) => {
      if (!u || !list || !el) return;
      // Nutze Offsets innerhalb der UL (stabiler als viewport-Rects bei 3D-Transforms)
      const left = el.offsetLeft - list.offsetLeft;
      const width = el.offsetWidth;
      u.style.width = `${width}px`;
      u.style.transform = `translateX(${left}px)`;
    };
    const step = () => {
      const el = items.length ? items[j % items.length] : null;
      items.forEach(s => s.classList.remove('hover'));
      if (el) { el.classList.add('hover'); pos(el); }
      j++;
    };
    const start = () => {
      stop();
      step();
      // Doppelte RAF, damit Layout & 3D-Transform stehen
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const current = items.length ? items[(j - 1 + items.length) % items.length] : null;
        if (current) pos(current);
      }));
      timer = setInterval(step, speedMs);
    };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };

    // Exponiere Steuerung am Panel
    panel._demoStart = start; panel._demoStop = stop; panel._demoStep = step;

    // Pause/Resume bei Hover auf Panel ODER Caption
    panel.addEventListener('mouseenter', () => { pauseAll(); });
    panel.addEventListener('mouseleave', () => { if (!prefersReduced) { resumeAll(); } });
  };

  // verschiedene Geschwindigkeiten für Variation
  panels.forEach((p, i) => attachDemo(p, i === 0 ? 1600 : i === 1 ? 1400 : 1800));

  // zusätzlich: Hover auf gesamtem Carousel pausiert alles
  carousel.addEventListener('mouseenter', pauseAll);
  carousel.addEventListener('mouseleave', resumeAll);

  // initiale Position & Start
  applyPositions();
  if (!prefersReduced) {
    panels.forEach(p => p._demoStart && p._demoStart());
    startRotation();
  } else {
    panels.forEach(p => p._demoStep && p._demoStep());
  }

  // bei Resize Underlines neu positionieren
  addEventListener('resize', () => {
    panels.forEach(p => {
      const dnav = p.querySelector('.demo-nav');
      const act = dnav ? dnav.querySelector('span.hover') : null;
      const u = dnav ? dnav.querySelector('.demo-underline') : null;
      const list = dnav ? dnav.querySelector('ul') : null;
      if (act && u && list) {
        const r = act.getBoundingClientRect();
        const pr = list.getBoundingClientRect();
        u.style.width = `${r.width}px`;
        u.style.transform = `translateX(${r.left - pr.left}px)`;
      }
    });
  });
});
