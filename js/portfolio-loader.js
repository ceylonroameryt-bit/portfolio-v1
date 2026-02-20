/**
 * Portfolio Loader — reads admin data from localStorage and updates the portfolio DOM
 * Runs automatically when index.html loads.
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'portfolioData';

  function getData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch { return null; }
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function applyAll(d) {
    applyHero(d.hero);
    applyAbout(d.about);
    applyExperience(d.experience);
    applyProjects(d.projects);
    applySkills(d.skills);
    applyContact(d.contact);
  }

  // ── HERO ──────────────────────────────────────
  function applyHero(h) {
    if (!h) return;

    // Name lines
    const lines = document.querySelectorAll('.hero-title .title-line');
    if (lines[0] && h.firstName) lines[0].textContent = h.firstName;
    if (lines[1] && h.lastName)  lines[1].textContent = h.lastName;

    // Subtitle
    const sub = document.querySelector('.hero-subtitle');
    if (sub && h.subtitle) sub.textContent = h.subtitle;

    // Open to Work badge
    const badge = document.querySelector('.open-to-work-badge');
    if (badge) {
      if (h.openToWork === false) {
        badge.style.display = 'none';
      } else {
        badge.style.display = '';
        const span = badge.querySelector('span:last-child');
        if (span && h.otwText) span.textContent = h.otwText;
      }
    }

    // Availability line
    const avail = document.querySelector('.availability-line');
    if (avail && h.availability) avail.textContent = '> ' + h.availability;

    // Hero terminal lines
    const descPs = document.querySelectorAll('.hero-description p');
    if (h.line1 && descPs[1]) descPs[1].textContent = '> ' + h.line1;
    if (h.line2 && descPs[2]) descPs[2].textContent = '> ' + h.line2;
    if (h.line3 && descPs[3]) descPs[3].textContent = '> ' + h.line3;
  }

  // ── ABOUT ─────────────────────────────────────
  function applyAbout(a) {
    if (!a) return;

    const intro = document.querySelector('.intro-text');
    if (intro && a.intro) intro.textContent = a.intro;

    const desc = document.querySelector('.about-description');
    if (desc && a.desc) desc.textContent = a.desc;

    // Stats
    if (a.stats && a.stats.length) {
      const statEls = document.querySelectorAll('.about-stats .stat');
      a.stats.forEach((s, i) => {
        if (!statEls[i]) return;
        const h3 = statEls[i].querySelector('h3');
        const p  = statEls[i].querySelector('p');
        if (h3 && s.val)   h3.textContent = s.val;
        if (p  && s.label) p.textContent  = s.label;
      });
    }
  }

  // ── EXPERIENCE ────────────────────────────────
  function applyExperience(exp) {
    if (!exp || !exp.length) return;
    const timeline = document.querySelector('.experience .timeline');
    if (!timeline) return;

    timeline.innerHTML = exp.map(e => {
      const awardHtml = e.award
        ? `<li><span class="award-badge">&#9733; ${escHtml(e.award)}</span></li>`
        : '';
      const bulletHtml = (e.bullets || [])
        .map(b => `<li>${escHtml(b)}</li>`)
        .join('\n');

      return `
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h3>${escHtml(e.title)}</h3>
            <p class="timeline-date">${escHtml(e.dateFrom)} &ndash; ${escHtml(e.dateTo)}</p>
            <p class="timeline-company">${escHtml(e.company)}${e.location ? ' &mdash; ' + escHtml(e.location) : ''}</p>
            <ul class="timeline-bullets">
              ${bulletHtml}
              ${awardHtml}
            </ul>
          </div>
        </div>`;
    }).join('\n');
  }

  // ── PROJECTS ──────────────────────────────────
  function applyProjects(projects) {
    if (!projects || !projects.length) return;
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = projects.map(p => {
      const featuredClass = p.featured ? 'project-card--featured' : '';
      const featuredTag   = p.featured ? '<span class="featured-tag">Featured</span>' : '';
      const tags = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      const tagHtml = tags.map(t => `<span class="tech-tag">${escHtml(t)}</span>`).join('\n');

      return `
        <div class="project-card ${featuredClass}">
          <div class="project-header">
            <h3>${escHtml(p.title)} ${featuredTag}</h3>
            <span class="project-year">${escHtml(p.year)}</span>
          </div>
          <p class="project-description">${escHtml(p.description)}</p>
          <div class="project-tech">${tagHtml}</div>
        </div>`;
    }).join('\n');
  }

  // ── SKILLS ────────────────────────────────────
  function applySkills(skills) {
    if (!skills) return;

    const map = {
      siem:       '[data-skill="siem"]',
      edr:        '[data-skill="edr"]',
      network:    '[data-skill="network"]',
      threat:     '[data-skill="threat"]',
      cloud:      '[data-skill="cloud"]',
      code:       '[data-skill="code"]',
      compliance: '[data-skill="compliance"]',
    };

    Object.keys(map).forEach(key => {
      const el = document.querySelector(map[key]);
      if (!el || !skills[key]) return;
      const items = skills[key].split(',').map(s => s.trim()).filter(Boolean);
      el.innerHTML = items.map(s => `<li>${escHtml(s)}</li>`).join('');
    });
  }

  // ── CONTACT ───────────────────────────────────
  function applyContact(c) {
    if (!c) return;

    const items = document.querySelectorAll('.contact-item');
    items.forEach(item => {
      const label = item.querySelector('.contact-label');
      if (!label) return;
      const key = label.textContent.trim().toLowerCase();
      const link = item.querySelector('a');
      const span = item.querySelector('span:last-child');

      if (key === 'email' && c.email) {
        if (link) { link.href = 'mailto:' + c.email; link.textContent = c.email; }
        else if (span) span.textContent = c.email;
      }
      if ((key === 'linkedin' || key.includes('linkedin')) && c.linkedin) {
        if (link) { link.href = c.linkedin; link.textContent = c.linkedin; }
      }
      if ((key === 'github' || key.includes('github')) && c.github) {
        if (link) { link.href = c.github; link.textContent = c.github; }
      }
      if (key === 'location' && c.location) {
        if (span) span.textContent = c.location;
        else if (link) link.textContent = c.location;
      }
    });
  }

  // ── INIT ──────────────────────────────────────
  const data = getData();
  if (data) {
    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => applyAll(data));
    } else {
      applyAll(data);
    }
  }
})();
