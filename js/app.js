/**
 * UI logic: renders content from data.js and wires up navigation, project
 * filtering, progressive loading and the project / CV modals.
 */
(() => {
  'use strict';

  const PAGE_SIZE = 6;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

  const chipHtml = (items) => (items || []).map((t) => `<span class="chip">${esc(t)}</span>`).join('');

  const linkHtml = (links) => (links || [])
    .map((l) => `<a class="plink" target="_blank" rel="noopener" href="${esc(l.url)}">${esc(l.label)}</a>`)
    .join('');

  let visibleCount = PAGE_SIZE;
  let lastFocused = null;

  /* Static sections ------------------------------------------------------- */
  function renderStats() {
    const host = $('#stats');
    if (!host) return;
    host.innerHTML = STATS.map((s) =>
      `<div class="stat"><div class="stat-n">${esc(s.value)}</div><div class="stat-l">${esc(s.label)}</div></div>`).join('');
  }

  function renderSkills() {
    const host = $('#skills');
    if (host) host.innerHTML = chipHtml(SKILLS);
  }

  function renderExperience() {
    const host = $('#timeline');
    if (!host) return;
    host.innerHTML = EXPERIENCE.map((e) => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div>
          <div class="tl-role">${esc(e.role)}</div>
          <div class="tl-company">${esc(e.org)}</div>
          <div class="tl-date">${esc(e.date)}</div>
          <div class="tl-desc">${esc(e.desc)}</div>
        </div>
      </div>`).join('');
  }

  const POST_LIMIT = 5;

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  function renderPosts(posts) {
    const host = $('#post-list');
    if (!host) return;
    host.innerHTML = posts.slice(0, POST_LIMIT).map((p) => {
      const meta = p.read ? `${esc(p.date)} · ${esc(p.read)}` : esc(p.date);
      return `
      <a class="post" href="${esc(p.url)}" target="_blank" rel="noopener">
        <div><div class="post-title">${esc(p.title)}</div><div class="post-tag">${esc(p.tag)}</div></div>
        <div class="post-meta">${meta}</div>
      </a>`;
    }).join('');
  }

  // Render the static list immediately, then upgrade to the live feed when reachable.
  async function loadPosts() {
    renderPosts(POSTS);
    try {
      const res = await fetch(POST_FEED, { mode: 'cors' });
      if (!res.ok) return;
      const xml = new DOMParser().parseFromString(await res.text(), 'application/xml');
      const entries = [...xml.querySelectorAll('entry')].slice(0, POST_LIMIT).map((e) => ({
        title: e.querySelector('title')?.textContent?.trim(),
        url: e.querySelector('link')?.getAttribute('href'),
        date: fmtDate(e.querySelector('published, updated')?.textContent),
        tag: e.querySelector('category')?.getAttribute('term') || 'Notes',
      })).filter((p) => p.title && p.url);
      if (entries.length) renderPosts(entries);
    } catch {
      /* offline or feed unreachable — keep the static fallback */
    }
  }

  /* Projects -------------------------------------------------------------- */
  function renderProjects(reset = false) {
    if (reset) visibleCount = PAGE_SIZE;
    const grid = $('#projects-grid');
    const loadBtn = $('#load-more-projects');
    const lessBtn = $('#show-less-projects');
    const count = $('#project-count');
    const visible = PROJECTS.slice(0, visibleCount);

    count.textContent = `showing ${visible.length} / ${PROJECTS.length} projects`;

    grid.innerHTML = visible.map((p, i) => {
      const actions = (p.links && p.links.length)
        ? `<div class="project-actions">${linkHtml(p.links.slice(0, 2))}</div>` : '';
      return `
      <article class="project-card" data-project-index="${i}" role="button" tabindex="0" aria-label="View details for ${esc(p.title)}">
        <div class="pcard-top"><span class="pcard-kicker">project</span><span class="pcard-type">${esc(p.category)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
        <div class="chips">${chipHtml((p.tech || []).slice(0, 4))}</div>
        ${actions}
      </article>`;
    }).join('');

    loadBtn.style.display = visibleCount >= PROJECTS.length ? 'none' : 'inline-flex';
    lessBtn.style.display = visibleCount > PAGE_SIZE ? 'inline-flex' : 'none';
  }

  /* Modals ---------------------------------------------------------------- */
  function openModal(el) {
    lastFocused = document.activeElement;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const close = el.querySelector('[data-close-modal]');
    if (close) close.focus();
  }

  function closeModals() {
    $$('.modal-backdrop.is-open').forEach((el) => {
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function openProject(index) {
    const p = PROJECTS[index];
    if (!p) return;
    $('#project-modal-kicker').textContent = p.category || 'project';
    $('#project-modal-title').textContent = p.title;
    const media = p.image ? `<img class="modal-media" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : '';
    const links = (p.links && p.links.length) ? `<div class="modal-links">${linkHtml(p.links)}</div>` : '';
    $('#project-modal-body').innerHTML = `
      <div class="modal-grid">
        <div>
          ${media}
          <p>${esc(p.description)}</p>
          <div class="modal-label">why it matters</div>
          <p>${esc(p.detail || p.summary)}</p>
          ${links}
        </div>
        <aside class="modal-side">
          <div class="modal-label">stack / area</div>
          <div class="chips">${chipHtml(p.tech)}</div>
          <div class="modal-label">type</div>
          <p>${esc(p.category)}</p>
        </aside>
      </div>`;
    openModal($('#project-modal'));
  }

  /* Background canvas: drifting particle network --------------------------- */
  function startBackground() {
    const canvas = $('#bg-canvas');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    const COUNT = 110;
    const LINK_DIST = 140;
    const COLOR = '0,255,200';
    let w; let h; let pts; let raf;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    const makePoint = () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.6, a: Math.random() * 0.45 + 0.4,
    });
    const init = () => { resize(); pts = Array.from({ length: COUNT }, makePoint); };

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLOR},${p.a})`;
        ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x; const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${COLOR},${0.2 * (1 - d / LINK_DIST)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', () => { cancelAnimationFrame(raf); init(); frame(); });
    init();
    frame();
  }

  /* Events ---------------------------------------------------------------- */
  function bindEvents() {
    const toggle = $('.nav-toggle');
    const menu = $('#nav-links');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      }
    });

    $('#load-more-projects').addEventListener('click', () => { visibleCount += PAGE_SIZE; renderProjects(); });

    $('#show-less-projects').addEventListener('click', () => {
      visibleCount = PAGE_SIZE;
      renderProjects();
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const grid = $('#projects-grid');
    const openFromCard = (e) => {
      if (e.target.closest('a')) return; // let real links work
      const card = e.target.closest('[data-project-index]');
      if (card) openProject(Number(card.dataset.projectIndex));
    };
    grid.addEventListener('click', openFromCard);
    grid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFromCard(e); }
    });

    $$('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeModals));
    $$('.modal-backdrop').forEach((bd) => bd.addEventListener('click', (e) => { if (e.target === bd) closeModals(); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });
  }

  function init() {
    renderStats();
    renderSkills();
    renderExperience();
    loadPosts();
    renderProjects();
    bindEvents();
    startBackground();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
