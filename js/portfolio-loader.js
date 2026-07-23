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

    const heroRole = document.querySelector('.hero-role');
    if (heroRole && h.subtitle) heroRole.textContent = h.subtitle;

    const chip = document.querySelector('.availability-chip');
    if (chip && h.otwText) {
      const textNode = Array.from(chip.childNodes).find(n => n.nodeType === 3);
      if (textNode) textNode.nodeValue = ' ' + h.otwText;
    }

    const bullets = document.querySelectorAll('.hero-bullets li');
    if (h.line1 && bullets[0]) bullets[0].textContent = h.line1;
    if (h.line2 && bullets[1]) bullets[1].textContent = h.line2;
    if (h.line3 && bullets[2]) bullets[2].textContent = h.line3;
    if (h.availability && bullets[3]) bullets[3].textContent = h.availability;

    const cardRole = document.querySelector('.hero-card-role');
    if (cardRole && h.subtitle) cardRole.textContent = h.subtitle;
  }

  // ── ABOUT ─────────────────────────────────────
  function applyAbout(a) {
    if (!a) return;

    const aboutCopy = document.querySelector('.about-copy');
    if (aboutCopy && (a.intro || a.desc)) {
      aboutCopy.innerHTML = `<p>${escHtml(a.intro)}</p><p>${escHtml(a.desc)}</p>`;
    }

    if (a.stats && a.stats.length) {
      const metricValues = document.querySelectorAll('.metric-value');
      a.stats.forEach((s, i) => {
        if (metricValues[i] && s.val && s.label) {
          metricValues[i].textContent = `${s.val} ${s.label}`;
        }
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
        ? `<span class="tl-award">★ ${escHtml(e.award)}</span>`
        : '';
      const bulletHtml = (e.bullets || [])
        .map(b => `<li>${escHtml(b)}</li>`)
        .join('\n');

      return `
        <div class="timeline-item">
          <div class="tl-date">
            <span class="date-range">${escHtml(e.dateFrom)}${e.dateTo ? ' – ' + escHtml(e.dateTo) : ''}</span>
            <span class="date-company">${escHtml(e.company)}</span>
          </div>
          <div class="tl-spine">
            <div class="tl-dot"></div>
            <div class="tl-line"></div>
          </div>
          <div class="tl-content">
            <h3>${escHtml(e.title)}</h3>
            ${awardHtml}
            <ul class="tl-bullets">
              ${bulletHtml}
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
      if ((key === 'website' || key.includes('website')) && c.website) {
        if (link) { link.href = c.website; link.textContent = c.website.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
      }
      if ((key === 'linkedin' || key.includes('linkedin')) && c.linkedin) {
        if (link) { link.href = c.linkedin; link.textContent = c.linkedin.replace(/^https?:\/\/(www\.)?/, ''); }
      }
      if ((key === 'phone' || key.includes('phone') || key.includes('whatsapp')) && c.phone) {
        if (link) { link.href = 'tel:' + c.phone.replace(/\s+/g, ''); link.textContent = c.phone; }
      }
      if ((key === 'github' || key.includes('github')) && c.github) {
        if (link) { link.href = c.github; link.textContent = c.github; }
      }
      if ((key === 'location' || key.includes('location')) && c.location) {
        const p = item.querySelector('p');
        if (p) p.textContent = c.location;
        else if (span) span.textContent = c.location;
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
