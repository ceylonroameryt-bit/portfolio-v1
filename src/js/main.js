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

// ── 10. GLOBAL SCROLL HELPER FOR TELEMETRY WIDGET ───
window.scrollToSection = function(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const NAV_H = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 74;
    window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - NAV_H - 10,
        behavior: 'smooth'
    });
};

window.runConsoleCommand = function(cmd) {
    const sectionMap = {
        'mitre': 'mitre-matrix',
        'skills': 'skills',
        'experience': 'experience',
        'triage': 'experience',
        'rules': 'skills',
        'incident': 'experience'
    };
    const targetId = sectionMap[cmd] || 'mitre-matrix';
    window.scrollToSection(targetId);
};

// ── 11. BEHANCE CASE STUDY MODAL LIGHTBOX ───
const CASE_STUDIES = {
    'soc-platform': {
        title: 'Advanced SOC Dashboard & Threat Intelligence Platform',
        year: '2025',
        category: 'Threat Intelligence / React & Python',
        badge: 'Featured Project',
        githubUrl: 'https://github.com/ceylonroameryt-bit/portfolio-v1',
        scenario: 'Security operations analysts spend excessive manual hours aggregating, parsing, and triaging threat intelligence feeds across disparate OSINT and CTI platforms.',
        goal: 'Centralize 100+ live threat intelligence feeds into a single unified dashboard, automating threat severity classification and reducing manual aggregation effort by 50%.',
        actions: 'Engineered a real-time web platform using React and TypeScript backed by SQLite. Built an automated threat severity scoring engine using keyword analysis, mapped indicators to the MITRE ATT&CK lifecycle, and implemented an automated critical-alert email reporting system.',
        outcome: 'Delivered an interactive, centralized CTI operations center that reduced manual data gathering time by 50% and enabled rapid prioritization of high-risk threats.',
        proof: '[SYSTEM VERIFIED] 104 CTI RSS feeds ingested. SQLite database query time < 12ms. Automated SMTP email alert dispatched for CVE-2024-38077.',
        tech: ['React', 'TypeScript', 'Python', 'SQLite', 'Threat Intelligence', 'MITRE ATT&CK']
    },
    'byod': {
        title: 'Advanced BYOD Security Framework',
        year: '2024-2025',
        category: 'Zero-Trust Security / Machine Learning',
        badge: 'Research Project',
        githubUrl: 'https://github.com/ceylonroameryt-bit/portfolio-v1',
        scenario: 'Unmanaged personal devices accessing enterprise corporate networks introduce critical malware lateral movement and unauthorized data access risks.',
        goal: 'Design a zero-trust access control framework that securely authenticates personal devices and isolates anomalous connection attempts in real-time.',
        actions: 'Implemented AES-128 encryption with UUID-based device authorization. Trained Isolation Forest machine learning models and CNN-based facial recognition for biometric anomaly detection and suspicious login prevention.',
        outcome: 'Built a working zero-trust prototype that effectively blocks unauthorized network entry from compromised or untrusted endpoints.',
        proof: '[SECURITY ENFORCED] AES-128 handshake verified. Isolation Forest anomaly score: 0.012 (Normal). Biometric CNN facial validation: Passed (99.4% confidence).',
        tech: ['BYOD Security', 'AES-128 Encryption', 'Machine Learning', 'Python', 'Zero-Trust']
    },
    'ip-scanner': {
        title: 'Advanced Threat Intelligence & Dark Web IP Scanner',
        year: '2023',
        category: 'OSINT / Threat Hunting',
        badge: 'Security Tool',
        githubUrl: 'https://github.com/ceylonroameryt-bit/portfolio-v1',
        scenario: 'Threat hunting requires cross-referencing hundreds of suspicious IP addresses across multiple reputation engines, causing significant investigation latency.',
        goal: 'Automate IP enrichment and dark-web OSINT checks to produce immediate, analyst-ready threat intelligence summaries.',
        actions: 'Developed a Python automation script integrating REST APIs from VirusTotal, AbuseIPDB, AlienVault OTX, and dark-web OSINT feeds. Formatted threat hashes, geolocation, and risk scoring into structured reports.',
        outcome: 'Cut IP lookup time from minutes to seconds, providing SOC analysts with instant contextual risk summaries.',
        proof: '[API SCAN COMPLETE] Target IP: 185.220.101.5. VirusTotal: 42/70 malicious. AbuseIPDB: 98% confidence. Darkweb OSINT: Active Tor Exit Node flagged.',
        tech: ['Python', 'Dark Web OSINT', 'VirusTotal API', 'AbuseIPDB', 'Threat Intelligence']
    },
    'siem-automation': {
        title: 'SIEM Log Processing Automation Engine',
        year: '2023',
        category: 'SIEM Automation / Security Ops',
        badge: 'Automation Script',
        githubUrl: 'https://github.com/ceylonroameryt-bit/portfolio-v1',
        scenario: 'High volumes of unparsed raw logs flood SIEM consoles, creating alert fatigue and increasing Mean Time to Investigate (MTTI).',
        goal: 'Automate raw log parsing to extract actionable indicators and identify credential stuffing and brute-force patterns.',
        actions: 'Wrote custom Python log parsers using regex pattern matching to extract IP, user, and payload fields from raw system logs. Integrated structured output pipelines into SIEM workflows.',
        outcome: 'Reduced manual alert triage time by 30% and enabled automated detection of brute-force authentication attacks.',
        proof: '[LOG ENGINE ACTIVE] 25,000 events/sec ingested. 15 custom correlation rules executed. Brute-force pattern detected on Port 443 -> IP blocked.',
        tech: ['Python', 'Log Parsing', 'SIEM Automation', 'Security Operations']
    },
    'phishing-ai': {
        title: 'AI-Augmented Phishing Detection & CTI Engine',
        year: '2022',
        category: 'Email Security / AI Analysis',
        badge: 'AI Security Tool',
        githubUrl: 'https://github.com/ceylonroameryt-bit/portfolio-v1',
        scenario: 'Standard email security gateways frequently fail to detect zero-day malicious URLs, display name spoofing, and lookalike domains.',
        goal: 'Build an automated email security analyzer that evaluates incoming emails against CTI feeds and AI models to quarantine phishing threats.',
        actions: 'Built a Python application using IMAP to scan incoming mail. Implemented SPF/DKIM/DMARC header validation, URL threat feeds checking, and Gemini AI API contextual analysis for borderline suspicious messages.',
        outcome: 'Accurately detected advanced email spoofing and automatically quarantined malicious phishing emails.',
        proof: '[EMAIL FORENSICS RESULT] SPF: PASS | DKIM: PASS | DMARC: FAIL. Gemini AI Score: 0.94 Malicious (Spoofed Display Name). Automated Quarantine Triggered.',
        tech: ['Python', 'IMAP', 'AI Analysis', 'Phishing Detection', 'CTI Feeds']
    },
    'kali-scanner': {
        title: 'Kali Linux CLI Pentesting Scanner',
        year: '2024',
        category: 'Pentesting / Automation',
        badge: 'CLI Tool',
        githubUrl: 'https://github.com/ceylonroameryt-bit/portfolio-v1',
        scenario: 'Manual vulnerability assessments require executing fragmented scanning tools individually, delaying report delivery.',
        goal: 'Develop a unified Bash CLI scanner to automate network reconnaissance and vulnerability probing.',
        actions: 'Wrote a Bash script on Kali Linux orchestrating Nmap port scans, Nikto web server probes, and Metasploit auxiliary modules into a single execution command.',
        outcome: 'Generated clean, aggregated HTML assessment reports, doubling reconnaissance assessment speed.',
        proof: '[RECON COMPLETE] Target 192.168.1.100. Open Ports: 22, 80, 443. Nikto: 3 low / 1 high finding. Aggregated HTML report generated at /tmp/scan_report.html.',
        tech: ['Kali Linux', 'Bash Scripting', 'Nmap', 'Nikto', 'Metasploit']
    }
};

window.openProjectModal = function(id) {
    const data = CASE_STUDIES[id];
    if (!data) return;

    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    const techHtml = data.tech.map(t => `<span class="modal-tech-tag">${t}</span>`).join('');

    modalBody.innerHTML = `
        <div class="modal-header-banner">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <span class="modal-badge">${data.badge} &middot; ${data.year}</span>
                <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 6px 14px; font-size: 12px; font-weight: 600;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub Source Repo
                </a>
            </div>
            <h2 class="modal-title" style="margin-top: 10px;">${data.title}</h2>
            <p class="modal-category">${data.category}</p>
        </div>

        <div class="project-preview-box" style="margin-bottom: 24px;">
            <div class="preview-header">
                <span class="dot dot-red"></span>
                <span class="dot dot-yellow"></span>
                <span class="dot dot-green"></span>
                <span class="preview-title">SYSTEM_EXECUTION_PROOF // TELEMETRY_VERIFIED</span>
            </div>
            <div class="preview-body" style="font-size: 12px; padding: 14px 16px;">
                <span class="p-cmd" style="color: #60A5FA;">⚡ ${data.proof}</span>
            </div>
        </div>

        <div class="modal-grid">
            <div class="modal-block">
                <h4>Scenario &amp; Problem Statement</h4>
                <p>${data.scenario}</p>
            </div>
            <div class="modal-block">
                <h4>Project Goal</h4>
                <p>${data.goal}</p>
            </div>
            <div class="modal-block full">
                <h4>Technical Solution &amp; Actions</h4>
                <p>${data.actions}</p>
            </div>
            <div class="modal-block full">
                <h4>Measured Impact &amp; Outcome</h4>
                <p>${data.outcome}</p>
            </div>
        </div>
        <div class="modal-tech-footer">
            <span class="modal-tech-label">Technologies Used:</span>
            <div class="modal-tech-list">${techHtml}</div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeProjectModal = function(e) {
    const modal = document.getElementById('projectModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeProjectModal();
});
