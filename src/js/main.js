// ============================================
// PORTFOLIO - OPTIMIZED JAVASCRIPT
// Clean, no dead code, proper theme colors
// ============================================

'use strict';

// ── 1. MOBILE MENU ──────────────────────────
(function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('navMenu');
    if (!toggleBtn || !menu) return;

    const closeMenu = () => {
        toggleBtn.classList.remove('active');
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
    };

    toggleBtn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('active');
        toggleBtn.classList.toggle('active', isOpen);
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on nav link click
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });
})();


// ── 2. NAVBAR SCROLL SHADOW + ACTIVE LINK ───
(function setupNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Add shadow on scroll
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    // Highlight active nav link
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const links = document.querySelectorAll('.nav-link');

    const onScroll = () => {
        const scrollY = window.scrollY + 120;
        let current = '';

        sections.forEach(sec => {
            if (scrollY >= sec.offsetTop) current = sec.id;
        });

        links.forEach(link => {
            const active = link.getAttribute('href') === '#' + current;
            link.classList.toggle('active', active);
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();


// ── 3. SMOOTH SCROLL ────────────────────────
(function setupSmoothScroll() {
    const NAV_H = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 72;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - NAV_H - 8,
                behavior: 'smooth'
            });
        });
    });
})();


// ── 4. SCROLL PROGRESS BAR ──────────────────
(function setupProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'height:3px',
        'background:var(--accent)', 'z-index:9999', 'width:0%',
        'transition:width 0.1s', 'border-radius:0 2px 2px 0'
    ].join(';');
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
        const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
})();


// ── 5. SCROLL-REVEAL ANIMATION ──────────────
(function setupScrollReveal() {
    if (!window.IntersectionObserver) return;

    const style = document.createElement('style');
    style.textContent = `
        .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    // Stagger cards in grids
    document.querySelectorAll(
        '.skill-category, .project-card, .cert-card, .pending-card, .metric-card'
    ).forEach((el, i) => {
        el.classList.add('reveal');
        if (i % 3 === 1) el.classList.add('reveal-delay-1');
        if (i % 3 === 2) el.classList.add('reveal-delay-2');
        observer.observe(el);
    });

    // Stagger timeline items
    document.querySelectorAll('.timeline-item').forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = (i * 0.15) + 's';
        observer.observe(el);
    });
})();


// ── 6. CONTACT FORM ─────────────────────────
(function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const showFeedback = (btn, text, color) => {
        btn.textContent = text;
        btn.style.background = color;
        btn.disabled = true;
    };

    const resetBtn = (btn, originalText) => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name    = form.querySelector('#name')?.value.trim() ?? '';
        const email   = form.querySelector('#email')?.value.trim() ?? '';
        const message = form.querySelector('#message')?.value.trim() ?? '';
        const btn     = form.querySelector('[type="submit"]');
        if (!btn) return;

        const originalText = btn.textContent;

        // Validate
        if (name.length < 2)      { form.querySelector('#name').focus();    return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { form.querySelector('#email').focus();   return; }
        if (message.length < 5)   { form.querySelector('#message').focus(); return; }

        showFeedback(btn, 'Sending…', 'var(--accent)');

        setTimeout(() => {
            showFeedback(btn, 'Message Sent ✓', 'var(--success)');
            form.reset();
            setTimeout(() => resetBtn(btn, originalText), 3000);
        }, 1000);
    });
})();


// ── 7. CERT CARD TILT (desktop) ─────────────
(function setupCardTilt() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    document.querySelectorAll('.cert-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
            const y = ((e.clientY - r.top)  / r.height - 0.5) * 12;
            card.style.transform = `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-3px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
})();


// ── 8. PAGE FADE-IN ─────────────────────────
(function setupFadeIn() {
    document.documentElement.style.opacity = '0';
    document.documentElement.style.transition = 'opacity 0.4s ease';
    window.addEventListener('load', () => {
        document.documentElement.style.opacity = '1';
    }, { once: true });
})();


// ── 9. VISIBILITY PAUSE ─────────────────────
document.addEventListener('visibilitychange', () => {
    document.body.style.animationPlayState = document.hidden ? 'paused' : 'running';
});
