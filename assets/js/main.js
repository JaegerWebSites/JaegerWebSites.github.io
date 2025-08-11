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

  // ===== Learn-More: 3D-Carousel + Demos =====
  const carousel = document.querySelector('[data-carousel]');
  const panelEls = carousel ? Array.from(carousel.querySelectorAll('.panel')) : [];

  // Helfer für Demo-Animationen (A, B, C) – wiederverwendbar für Panels und Pläne
  const attachDemo = (root, speedMs = 1600) => {
    const type = (root.dataset.demo || '').toLowerCase();
    let timer = null; let j = 0;

    // A + A2: klassische Top-Navigation
    if (type.startsWith('a')) {
      const dnav = root.querySelector('.demo-nav');
      const list = dnav ? dnav.querySelector('ul') : null;
      const items = dnav ? Array.from(dnav.querySelectorAll('li span')) : [];
      const u = dnav ? dnav.querySelector('.demo-underline') : null;
      const pos = (el) => {
        if (!u || !list || !el) return;
        const left = el.offsetLeft - list.offsetLeft;
        u.style.width = `${el.offsetWidth}px`;
        u.style.transform = `translateX(${left}px)`;
      };
      const step = () => {
        const el = items.length ? items[j % items.length] : null;
        items.forEach(s => s.classList.remove('hover'));
        if (el) { el.classList.add('hover'); pos(el); }
        j++;
      };
      const start = () => { stop(); step(); timer = setInterval(step, speedMs); };
      const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
      root._demoStart = start; root._demoStop = stop; root._demoStep = step; return {start, stop, step};
    }

    // B + B2: Hamburger → Seitenpanel
    if (type.startsWith('b')) {
      const panel = root.querySelector('.side-panel');
      const dnav = root.querySelector('.side-nav');
      const list = dnav ? dnav.querySelector('ul') : null;
      const items = dnav ? Array.from(dnav.querySelectorAll('li span')) : [];
      const hl = root.querySelector('.side-highlight');
      const pos = (el) => {
        if (!panel || !dnav || !list || !hl || !el) return;
        const top = el.offsetTop - list.offsetTop + 4; // 4px Padding-Korrektur
        hl.style.transform = `translateY(${top}px)`;
        hl.style.height = `${el.offsetHeight}px`;
      };
      const step = () => {
        if (panel) panel.classList.add('open');
        const el = items.length ? items[j % items.length] : null;
        items.forEach(s => s.classList.remove('hover'));
        if (el) { el.classList.add('hover'); pos(el); }
        j++;
      };
      const start = () => { stop(); step(); timer = setInterval(step, Math.max(1100, speedMs)); };
      const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
      root._demoStart = start; root._demoStop = stop; root._demoStep = step; return {start, stop, step};
    }

    // C + C2: Pill-Navigation
    if (type.startsWith('c')) {
      const pillsWrap = root.querySelector('.pills');
      const pills = pillsWrap ? Array.from(pillsWrap.querySelectorAll('.pill')) : [];
      const ind = pillsWrap ? pillsWrap.querySelector('.pill-indicator') : null;
      const pos = (el) => {
        if (!pillsWrap || !ind || !el) return;
        const left = el.offsetLeft - pillsWrap.offsetLeft;
        ind.style.width = `${el.offsetWidth}px`;
        ind.style.transform = `translateX(${left}px)`;
      };
      const step = () => {
        const el = pills.length ? pills[j % pills.length] : null;
        pills.forEach(p => p.classList.remove('active'));
        if (el) { el.classList.add('active'); pos(el); }
        j++;
      };
      const start = () => { stop(); step(); timer = setInterval(step, Math.max(1300, speedMs)); };
      const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
      root._demoStart = start; root._demoStop = stop; root._demoStep = step; return {start, stop, step};
    }

    return null;
  };

  // Demos an Carousel-Panels anhängen
  const panelDemos = panelEls.map((p, i) => attachDemo(p, i === 0 ? 1500 : i === 1 ? 1300 : 1700)).filter(Boolean);

  // Carousel-Rotation
  let idx = 0; let rotating = false; let rotTimer = null;
  const applyPositions = () => {
    panelEls.forEach(p => p.classList.remove('is-front','is-left','is-right'));
    const front = panelEls[idx % panelEls.length];
    const right = panelEls[(idx + 1) % panelEls.length];
    const left  = panelEls[(idx + 2) % panelEls.length];
    if (front) front.classList.add('is-front');
    if (right) right.classList.add('is-right');
    if (left)  left.classList.add('is-left');
  };
  const pausePanels = () => { panelDemos.forEach(d => d.stop()); };
  const resumePanels = () => { panelDemos.forEach(d => d.start()); };

  const ROTATE_INTERVAL_MS = 3200; // etwas langsamer als 2.5s
  const PANEL_TRANS_MS = 800;

  const beginRotation = () => { if (rotating) return; rotating = true; carousel.classList.add('is-rotating'); pausePanels(); };
  const endRotation   = () => { rotating = false; carousel.classList.remove('is-rotating'); requestAnimationFrame(() => requestAnimationFrame(resumePanels)); };

  const rotateOnce = () => { beginRotation(); idx = (idx + 1) % panelEls.length; applyPositions(); setTimeout(endRotation, PANEL_TRANS_MS + 120); };
  const startRotation = () => { if (rotTimer) clearInterval(rotTimer); rotTimer = setInterval(rotateOnce, ROTATE_INTERVAL_MS); };
  const stopRotation  = () => { if (rotTimer) { clearInterval(rotTimer); rotTimer = null; } };

  if (carousel) {
    applyPositions();
    panelDemos.forEach(d => d.start());
    startRotation();

    // Klick auf Panel-Fenster oder Caption → zum jeweiligen Plan scrollen
    const map = { a: '#plan-a', b: '#plan-b', c: '#plan-c' };
    panelEls.forEach(p => {
      const type = (p.dataset.demo || '').toLowerCase();
      const targetSel = map[type];
      if (!targetSel) return;
      const go = (e) => {
        e.preventDefault();
        const t = document.querySelector(targetSel);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      const win = p.querySelector('.demo-window');
      if (win) win.addEventListener('click', go);
      const cap = p.querySelector('.caption-link');
      if (cap) { cap.setAttribute('href', targetSel); cap.addEventListener('click', go); }
    });

    // Hover auf Carousel pausiert nur Rotation & Demos der Panels
    carousel.addEventListener('mouseenter', () => { stopRotation(); pausePanels(); });
    carousel.addEventListener('mouseleave', () => { startRotation(); resumePanels(); });
  }

  // ===== Demos in den Plans darunter =====
  const planEls = Array.from(document.querySelectorAll('.plan'));
  const planDemos = planEls.map((el, i) => attachDemo(el, i === 1 ? 1400 : 1600)).filter(Boolean);

  // bei Resize alle Indikatoren sauber neu setzen
  addEventListener('resize', () => {
    [...panelDemos, ...planDemos].forEach(d => d.step());
  });
});
