/*
  Navigation: aktiver Link + animierter Underline-Indicator
  Mobile-Menü: Toggle
  Kleinigkeiten: dynamisches Jahr
  + Learn-More: 3D-Carousel mit drei Demo-„Videos“ (Simulation)
  + About: Kontaktformular-Validierung & Anker-Scroll
*/

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const navList = nav ? nav.querySelector('ul') : null;
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
    if (!underline || !navList || !el) return;
    const r = el.getBoundingClientRect();
    const pr = navList.getBoundingClientRect();
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
      const listEl = dnav ? dnav.querySelector('ul') : null;
      const items = dnav ? Array.from(dnav.querySelectorAll('li span')) : [];
      const u = dnav ? dnav.querySelector('.demo-underline') : null;
      const pos = (el) => {
        if (!u || !listEl || !el) return;
        const left = el.offsetLeft - listEl.offsetLeft;
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
  const listEl = dnav ? dnav.querySelector('ul') : null;
  const items = dnav ? Array.from(dnav.querySelectorAll('li span')) : [];
  const hamburger = root.querySelector('.hamburger');
  const bars = hamburger ? Array.from(hamburger.querySelectorAll('span')) : [];

  // Bars exakt unter Wörter setzen
  function measureBars() {
    if (!hamburger || bars.length < 3 || items.length < 3) return;
    const hb = hamburger.getBoundingClientRect();
    items.slice(0, 3).forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const x = Math.round(r.left - hb.left);
      const y = Math.round(r.bottom - hb.top);
      const w = Math.round(r.width);
      root.style.setProperty(`--b${i + 1}x`, `${x}px`);
      root.style.setProperty(`--b${i + 1}y`, `${y}px`);
      root.style.setProperty(`--b${i + 1}w`, `${w}px`);
    });
  }

  let timer = null, j = 0;
  const step = () => {
    const el = items.length ? items[j % items.length] : null;
    items.forEach(s => s.classList.remove('hover'));
    if (el) el.classList.add('hover');
    j++;
  };

  const start = () => {
    stop();
    step();
    timer = setInterval(step, Math.max(1400, speedMs));
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

  // Panel-Öffnung → Hamburger aktivieren und messen
  if (panel && hamburger) {
    panel.addEventListener('animationstart', () => {
      hamburger.classList.add('active');
      setTimeout(measureBars, 200);
    });
    panel.addEventListener('animationend', () => {
      hamburger.classList.remove('active');
    });
  }

  // Initial messen
  requestAnimationFrame(() => requestAnimationFrame(measureBars));
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => requestAnimationFrame(measureBars));
  });

  root._demoStart = start; root._demoStop = stop; root._demoStep = step;
  return { start, stop, step };
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

  const ROTATE_INTERVAL_MS = 3800; // langsamer
  const PANEL_TRANS_MS = 800;

  const beginRotation = () => { if (rotating) return; rotating = true; if (carousel) carousel.classList.add('is-rotating'); pausePanels(); };
  const endRotation   = () => { rotating = false; if (carousel) carousel.classList.remove('is-rotating'); requestAnimationFrame(() => requestAnimationFrame(resumePanels)); };

  const rotateOnce = () => { if (!panelEls.length) return; beginRotation(); idx = (idx + 1) % panelEls.length; applyPositions(); setTimeout(endRotation, PANEL_TRANS_MS + 120); };
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
  planDemos.forEach(d => d.start());

  // ===== About: wenn mit Hash geladen → zum Formular scrollen, dann Fokus setzen
  const contactSection = document.getElementById('contact-form');
  if (getFile(window.location.pathname) === 'about.html' && window.location.hash === '#contact-form' && contactSection) {
    setTimeout(() => {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const first = contactSection.querySelector('#firstName');
      if (first) first.focus({ preventScroll: true });
    }, 60);
  }

  // ===== About: Formular-Validierung & Mailto-Fallback =====
  const form = document.getElementById('contactForm');
  if (form) {
    const err = form.querySelector('.form-error');
    const fields = {
      firstName: form.querySelector('#firstName'),
      lastName: form.querySelector('#lastName'),
      email: form.querySelector('#email'),
      website: form.querySelector('#website'),
      message: form.querySelector('#message')
    };

    const clearErrors = () => {
      Object.values(fields).forEach(f => f && f.classList.remove('invalid'));
      if (err) err.hidden = true;
    };

    const validEmail = (v) => /.+@.+\..+/.test(v);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();
      let ok = true;
      if (!fields.firstName.value.trim()) { fields.firstName.classList.add('invalid'); ok = false; }
      if (!fields.lastName.value.trim())  { fields.lastName.classList.add('invalid');  ok = false; }
      if (!fields.email.value.trim() || !validEmail(fields.email.value.trim())) { fields.email.classList.add('invalid'); ok = false; }

      if (!ok) {
        if (err) err.hidden = false;
        return;
      }

      // Mailto-Fallback – öffnet Standard-Mailprogramm mit vorgefülltem Text
      const to = 'benedikt.jaeger.bjj@gmail.com';
      const subject = 'Kontaktanfrage Jäger WebSites';
      const body = [
        `Name: ${fields.lastName.value.trim()}`,
        `Vorname: ${fields.firstName.value.trim()}`,
        `Website: ${fields.website.value.trim() || '-'}`,
        `E-Mail: ${fields.email.value.trim()}`,
        `Text: ${fields.message.value.trim() || '-'}`
      ].join('\r\n');

      const m = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const a = document.createElement('a');
      a.href = m; a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    // Live-Fehler zurücknehmen, sobald Nutzer tippt / Fokus verliert
    ['firstName','lastName','email'].forEach(key => {
      const f = fields[key];
      if (!f) return;
      f.addEventListener('input', () => {
        f.classList.remove('invalid');
        if (err) err.hidden = true;
      });
      f.addEventListener('blur', () => {
        if (key === 'email') {
          if (f.value && !/.+@.+\..+/.test(f.value)) f.classList.add('invalid'); else f.classList.remove('invalid');
        } else {
          if (f.value.trim()) f.classList.remove('invalid');
        }
      });
    });
  }

  // bei Resize alle Indikatoren sauber neu setzen
  addEventListener('resize', () => {
    [...(panelEls.length ? panelDemos : []), ...planDemos].forEach(d => d.step && d.step());
  });
});
