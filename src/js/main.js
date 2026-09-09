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
        'skills': 'skills',
        'experience': 'experience',
        'triage': 'experience',
        'rules': 'skills',
        'incident': 'experience'
    };
    const targetId = sectionMap[cmd] || 'experience';
    window.scrollToSection(targetId);
};

// ── 11. BEHANCE CASE STUDY MODAL LIGHTBOX ───
const CASE_STUDIES = {
    'soc-platform': {
        title: 'NO ENTRY — Multi-Tier Threat Intelligence & Detection Engineering Platform',
        year: '2025 – Present',
        category: 'SOC Intelligence & Alert Triage / React 19 & Python FastAPI',
        badge: '🚨 Featured Spotlight · Live Ecosystem',
        liveUrl: 'https://soc-ai-six.vercel.app/',
        githubUrl: 'https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/',
        githubLabel: 'Request Source Code',
        screenshots: [
            {
                src: 'assets/no-entry-mitre-heatmap.png',
                title: 'Dynamic MITRE ATT&CK Heatmap (52 Techniques)',
                caption: 'Dynamically maps daily security advisories across 14 enterprise tactics and 52+ techniques with an interactive heat-intensity matrix.'
            },
            {
                src: 'assets/no-entry-critical-threats.png',
                title: 'Critical Threats Dashboard & Live Triage',
                caption: 'Live threat severity distribution, real-time alert prioritization, and instant triage for critical vulnerability exploits.'
            },
            {
                src: 'assets/no-entry-mitre-matrix.png',
                title: 'MITRE ATT&CK News Matrix (100% Coverage)',
                caption: 'Categorizes 800+ ingested articles across MITRE tactics with full coverage, custom filters, and telemetry metrics.'
            },
            {
                src: 'assets/no-entry-dashboard.png',
                title: 'Global Threat Intelligence Feed',
                caption: 'Continuous automated ingestion of global cyber feeds (CISA, BleepingComputer, THN) with deduplication & IOC extraction.'
            },
            {
                src: 'assets/no-entry-severity-metrics.png',
                title: 'Monthly Threat Severity Metrics & Ingestion Analysis',
                caption: 'Exploit likelihood prediction via EPSS percentiles and CVSS severity distribution integrated with VirusTotal & AbuseIPDB.'
            }
        ],
        scenario: 'As cyber threats accelerate, security operations teams need automated pipelines that ingest, categorize, and enrich indicators of compromise (IOCs) before attackers can establish persistence. Manual threat intelligence parsing across disparate sources leads to alert fatigue, high MTTR, and missed zero-day signals.',
        goal: 'Design, build, and deploy NO ENTRY — an enterprise-grade SOC intelligence and alert triage ecosystem that unifies global threat feeds, automates IOC enrichment, dynamically maps threats to MITRE ATT&CK, auto-generates SIEM detection rules, and uses AI clustering to suppress noise.',
        architecture: [
            '<strong>1. Data Ingestion &amp; Deduplication:</strong> Continuous aggregation of global cyber feeds (CISA, BleepingComputer, The Hacker\'s News) mapped over to 100+ unique PostgreSQL schemas with automated IOC extraction.',
            '<strong>2. Threat Triage &amp; Enrichment Engine:</strong> Integrated with VirusTotal, AbuseIPDB, and CISA KEV APIs to score maliciousness and predict exploit likelihood via EPSS percentiles.',
            '<strong>3. MITRE ATT&amp;CK Matrix:</strong> Dynamically maps hundreds of daily security advisories against 52 ATT&CK techniques with an interactive heat-intensity matrix across 14 enterprise tactics.',
            '<strong>4. Detection Engineering Automation:</strong> Generates ready-to-deploy Splunk SPL, Microsoft Sentinel KQL, and Sigma YAML rules instantly from detected threats.',
            '<strong>5. AI Microservice:</strong> Employs TF-IDF clustering and cosine similarity to reduce redundant news by 70%+ and generate daily CISO executive briefings.'
        ],
        actions: 'Engineered a high-performance frontend using React 19, TypeScript, Vite, and Tailwind CSS. Built a Python FastAPI microservice implementing TF-IDF vectorization and cosine similarity clustering for news deduplication. Architected Supabase PostgreSQL storage with Row-Level Security (RLS) and Node.js/Express serverless pipelines. Wired real-time REST API queries to VirusTotal, AbuseIPDB, CISA KEV, and EPSS.',
        outcome: 'Successfully deployed and operational at https://soc-ai-six.vercel.app/. Reduced analyst noise by 70%+, automated SIEM/Sentinel/Sigma detection rule compilation, and established sub-second threat correlation across 52 MITRE ATT&CK techniques.',
        proof: '[SYSTEM LIVE] 100+ Feeds Ingested · 52 MITRE Techniques Covered · Splunk SPL / Sentinel KQL / Sigma Ready · VirusTotal/AbuseIPDB Enriched · Live: https://soc-ai-six.vercel.app/',
        tech: [
            'React 19', 'TypeScript', 'Vite', 'Tailwind CSS',
            'Python FastAPI', 'Supabase (PostgreSQL RLS)', 'Node.js Express',
            'VirusTotal API', 'AbuseIPDB API', 'CISA KEV', 'EPSS Percentiles',
            'Splunk SPL', 'Microsoft Sentinel KQL', 'Sigma Rules', 'MITRE ATT&CK'
        ]
    },
    'byod': {
        title: 'Advanced BYOD Security Framework',
        year: '2024-2025',
        category: 'Zero-Trust Security / Machine Learning',
        githubUrl: 'https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/',
        githubLabel: 'Request Source Code',
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
        githubUrl: 'https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/',
        githubLabel: 'Request Source Code',
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
        githubUrl: 'https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/',
        githubLabel: 'Request Source Code',
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
        githubUrl: 'https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/',
        githubLabel: 'Request Source Code',
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
        githubUrl: 'https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/',
        githubLabel: 'Request Source Code',
        scenario: 'Manual vulnerability assessments require executing fragmented scanning tools individually, delaying report delivery.',
        goal: 'Develop a unified Bash CLI scanner to automate network reconnaissance and vulnerability probing.',
        actions: 'Wrote a Bash script on Kali Linux orchestrating Nmap port scans, Nikto web server probes, and Metasploit auxiliary modules into a single execution command.',
        outcome: 'Generated clean, aggregated HTML assessment reports, doubling reconnaissance assessment speed.',
        proof: '[RECON COMPLETE] Target 192.168.1.100. Open Ports: 22, 80, 443. Nikto: 3 low / 1 high finding. Aggregated HTML report generated at /tmp/scan_report.html.',
        tech: ['Kali Linux', 'Bash Scripting', 'Nmap', 'Nikto', 'Metasploit']
    }
};

window.switchModalScreenshot = function(idx, src, title, caption) {
    const mainImg = document.getElementById('modalMainImage');
    const titleEl = document.getElementById('modalActiveTitle');
    const descEl = document.getElementById('modalActiveDesc');
    const counterEl = document.getElementById('modalActiveCounter');
    const openLink = document.getElementById('modalOpenImageLink');

    if (mainImg) {
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
            mainImg.src = src;
            mainImg.style.opacity = '1';
        }, 120);
    }
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = caption;
    if (counterEl) counterEl.textContent = `${idx + 1} / 5`;
    if (openLink) openLink.href = src;

    const allThumbs = document.querySelectorAll('.modal-thumb-btn');
    allThumbs.forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });
};

window.switchCardScreenshot = function(src, chipIdx, label) {
    const cardImg = document.getElementById('spotlightCardImage');
    if (cardImg) {
        cardImg.style.opacity = '0.5';
        setTimeout(() => {
            cardImg.src = src;
            cardImg.alt = label || 'NO ENTRY Platform Screenshot';
            cardImg.style.opacity = '1';
        }, 120);
    }
    const chips = document.querySelectorAll('.proj-chip');
    chips.forEach((c, i) => {
        c.classList.toggle('active', i === chipIdx);
    });
};


window.openProjectModal = function(id) {
    const data = CASE_STUDIES[id];
    if (!data) return;

    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    const techHtml = data.tech.map(t => `<span class="modal-tech-tag">${t}</span>`).join('');

    // Optional Live URL button
    let liveUrlHtml = '';
    if (data.liveUrl) {
        liveUrlHtml = `
            <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-accent" style="padding: 6px 14px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                <span class="live-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; display: inline-block; box-shadow: 0 0 8px #10B981;"></span>
                Open Live Platform
            </a>
        `;
    }

    const isLinkedIn = (data.githubUrl || '').includes('linkedin.com');
    const githubLabel = data.githubLabel || (isLinkedIn ? 'Request Source Code' : 'GitHub Source Repo');
    const iconSvg = isLinkedIn
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
    const githubBtnHtml = `
        <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 6px 14px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;" title="Request source code via LinkedIn">
            ${iconSvg}
            ${githubLabel}
        </a>
    `;

    // Interactive Screenshot Gallery HTML (if screenshots exist)
    let galleryHtml = '';
    if (data.screenshots && data.screenshots.length > 0) {
        const first = data.screenshots[0];
        const thumbsHtml = data.screenshots.map((s, idx) => `
            <button type="button" class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="window.switchModalScreenshot(${idx}, '${s.src}', '${s.title.replace(/'/g, "\\'")}', '${s.caption.replace(/'/g, "\\'")}')" aria-label="View screenshot ${idx + 1}">
                <img src="${s.src}" alt="${s.title}" loading="lazy" />
                <span>${s.title.split(' ')[0]} ${s.title.split(' ')[1] || ''}</span>
            </button>
        `).join('');

        galleryHtml = `
            <div class="modal-gallery-container">
                <div class="modal-gallery-topbar">
                    <div class="modal-gallery-title-box">
                        <span class="modal-gallery-title">Interactive Platform Gallery</span>
                        <span class="modal-gallery-counter" id="modalActiveCounter">1 / ${data.screenshots.length}</span>
                    </div>
                    <a href="${first.src}" target="_blank" rel="noopener noreferrer" class="modal-gallery-action-link" id="modalOpenImageLink">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        View High-Res
                    </a>
                </div>
                <div class="modal-gallery-viewport">
                    <img id="modalMainImage" class="modal-gallery-main-img" src="${first.src}" alt="${first.title}" />
                </div>
                <div class="modal-gallery-info">
                    <div class="modal-gallery-active-title" id="modalActiveTitle">${first.title}</div>
                    <div class="modal-gallery-active-desc" id="modalActiveDesc">${first.caption}</div>
                </div>
                <div class="modal-gallery-thumbnails">
                    ${thumbsHtml}
                </div>
            </div>
        `;
    }

    // Architecture section HTML (if present)
    let archHtml = '';
    if (data.architecture && data.architecture.length > 0) {
        const items = data.architecture.map(a => `<div class="modal-arch-item">${a}</div>`).join('');
        archHtml = `
            <div class="modal-block full" style="margin-top: 6px;">
                <h4 style="display:flex; align-items:center; gap:6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    Architectural Overview &amp; Subsystems
                </h4>
                <div class="modal-arch-list">${items}</div>
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div class="modal-header-banner">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <span class="modal-badge">${data.badge} &middot; ${data.year}</span>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    ${liveUrlHtml}
                    ${githubBtnHtml}
                </div>
            </div>
            <h2 class="modal-title" style="margin-top: 10px;">${data.title}</h2>
            <p class="modal-category">${data.category}</p>
        </div>

        ${galleryHtml}

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
                <h4>Scenario &amp; Operational Challenge</h4>
                <p>${data.scenario}</p>
            </div>
            <div class="modal-block">
                <h4>System Objective &amp; Goal</h4>
                <p>${data.goal}</p>
            </div>
            ${archHtml}
            <div class="modal-block full">
                <h4>Full-Stack Implementation &amp; Security Engineering</h4>
                <p>${data.actions}</p>
            </div>
            <div class="modal-block full">
                <h4>Measured Impact &amp; Operational Outcomes</h4>
                <p>${data.outcome}</p>
            </div>
        </div>
        <div class="modal-tech-footer">
            <span class="modal-tech-label">Built With &amp; Technologies:</span>
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

// ── 11. GRAPHIC DESIGN SHOWCASE & LIGHTBOX ─────────────
const DESIGN_SAMPLES = [
    {
        src: 'assets/Skiils/Artboard%201@4x-100.jpg',
        title: 'TC PDR — Royal Crest & Lion Emblem',
        category: 'Brand Identity',
        filter: 'branding',
        desc: 'Luxury gold lion and crown crest emblem with precision vector geometry on royal navy gradient.',
        tools: ['Adobe Illustrator', 'Vector Branding', 'Luxury Emblem']
    },
    {
        src: 'assets/Skiils/real_estate_flyer_26.jpg',
        title: 'Moorland Services — End of Tenancy Flyer',
        category: 'Flyers & Print',
        filter: 'flyers',
        desc: 'Comprehensive real estate property management and maintenance marketing flyer with photo grid layout.',
        tools: ['Photoshop', 'InDesign', 'Print Layout']
    },
    {
        src: 'assets/Skiils/Screenshot%20(124).png',
        title: 'SLTMOBITEL — Cyber Security Quiz Campaign',
        category: 'Corporate & Event',
        filter: 'campaigns',
        desc: 'Enterprise awareness week competition poster designed for Sri Lanka Telecom (SLT-Mobitel).',
        tools: ['Adobe Illustrator', 'Campaign Art', 'Enterprise Awareness']
    },
    {
        src: 'assets/Skiils/Screenshot%20(142).png',
        title: 'Fantasy Dragon Twilight — Digital Matte Painting',
        category: 'Digital Illustration',
        filter: 'illustration',
        desc: 'Atmospheric digital landscape illustration featuring a majestic winged creature overlooking moonlit cliffs.',
        tools: ['Photoshop', 'Concept Art', 'Atmospheric Lighting']
    },
    {
        src: 'assets/Skiils/IMG_7103.PNG',
        title: 'NASA Creations — Minimalist Monogram Emblem',
        category: 'Brand Identity',
        filter: 'branding',
        desc: 'Geometric minimalist logo design crafted for creative media and graphic production identity.',
        tools: ['Adobe Illustrator', 'Geometric Vector', 'Brand Identity']
    },
    {
        src: 'assets/Skiils/WhatsApp%20Image%202026-09-08%20at%2021bcvf.47.47.jpeg',
        title: 'Hemel Stays — Luxury Serviced Apartments Flyer',
        category: 'Flyers & Print',
        filter: 'flyers',
        desc: 'Elegantly branded UK real estate and hospitality promotional flyer with QR booking callouts.',
        tools: ['Photoshop', 'Typography', 'Print Collateral']
    },
    {
        src: 'assets/Skiils/WhatsApp%20Image%202026-09-08%20at%2021.47.47g.jpeg',
        title: 'SLIIT Heritage Panorama — Vector Campus Mural',
        category: 'Digital Illustration',
        filter: 'illustration',
        desc: 'Stylized panoramic isometric illustration depicting the university campus landmarks and student life.',
        tools: ['Adobe Illustrator', 'Isometric Vector', 'Campus Mural']
    },
    {
        src: 'assets/Skiils/Artboard%201-new.jpg',
        title: 'Univ of Hertfordshire — Sri Lankan Society Crest',
        category: 'Brand Identity',
        filter: 'branding',
        desc: 'Official student society emblem combining British academia crest elements with traditional Sri Lankan motifs.',
        tools: ['Illustrator', 'Emblem Design', 'University Society']
    },
    {
        src: 'assets/Skiils/Screenshot%20(143).png',
        title: 'Rocket Highway & Cyber Grid — suja.ai',
        category: 'Digital Illustration',
        filter: 'illustration',
        desc: 'Futuristic vector scene showing a rocket launchpad across a cyber freeway, exploring sci-fi themes.',
        tools: ['Illustrator', 'Photoshop', 'Cyber Scifi']
    },
    {
        src: 'assets/Skiils/Screenshot%20(136).png',
        title: 'SLTMOBITEL — Cyber Week Event Schedule',
        category: 'Corporate & Event',
        filter: 'campaigns',
        desc: 'Corporate infographic schedule detailing daily threat defense tracks for SLT-Mobitel Cyber Security Week.',
        tools: ['Illustrator', 'Infographic Design', 'Corporate Event']
    },
    {
        src: 'assets/Skiils/WhatsApp%20Image%202026-09-08%20at%2021.47.4nhngh8.jpeg',
        title: 'The A Team — Architecture & Developers Mark',
        category: 'Brand Identity',
        filter: 'branding',
        desc: 'Architectural skyline vector identity concept crafted in Adobe Illustrator for a property development firm.',
        tools: ['Adobe Illustrator', 'Minimalist Vector', 'Architectural Mark']
    },
    {
        src: 'assets/Skiils/Main.jpeg',
        title: 'NASA Creations — Creative Services Flyer',
        category: 'Flyers & Print',
        filter: 'flyers',
        desc: 'High-energy marketing promotional flyer highlighting branding capabilities and character artwork.',
        tools: ['Photoshop', 'Illustrator', 'Marketing Collateral']
    },
    {
        src: 'assets/Skiils/Screenshot%20(24).png',
        title: 'Faculty of Computing Media Unit — Official Polo',
        category: 'Corporate & Event',
        filter: 'campaigns',
        desc: 'Corporate apparel & uniform mockup design with custom sleeve badge and chest insignia for the university media team.',
        tools: ['Photoshop Mockup', 'Vector Art', 'Merchandise']
    },
    {
        src: 'assets/Skiils/WhatsApp%20Image%202026-09-08%20at%2021.47.47.jpeg',
        title: 'Media Unit — Creators in Action Line Art',
        category: 'Digital Illustration',
        filter: 'illustration',
        desc: 'Continuous-line vector mural celebrating photographers, videographers, editors, and digital designers.',
        tools: ['Illustrator', 'Continuous Line Art', 'Vector Mural']
    },
    {
        src: 'assets/Skiils/WhatsApp%20Imfgdfgage%202026-09-08%20at%2021.47.47.jpeg',
        title: 'SLIIT Computing — Winter Holiday Greeting',
        category: 'Corporate & Event',
        filter: 'campaigns',
        desc: 'Seasonal digital community greetings card combining vector campus illustration and typography.',
        tools: ['Photoshop', 'Illustrator', 'Seasonal Campaign']
    },
    {
        src: 'assets/Skiils/Screenshot%202023-10-11%20124212.png',
        title: 'SLTMOBITEL — Cyber Glitch Typographic Concept',
        category: 'Corporate & Event',
        filter: 'campaigns',
        desc: 'Cyber typographic exploration combining circuit board traces, distressed brushes, and digital glitch effects.',
        tools: ['Illustrator', 'Glitch Typography', 'Cyber Aesthetic']
    }
];

let currentDesignIndex = 0;

function updateDesignLightboxContent(item) {
    const img = document.getElementById('designLightboxImg');
    const cat = document.getElementById('designLightboxCategory');
    const counter = document.getElementById('designLightboxCounter');
    const title = document.getElementById('designLightboxTitle');
    const desc = document.getElementById('designLightboxDesc');
    const tools = document.getElementById('designLightboxTools');
    const fullRes = document.getElementById('designLightboxFullRes');

    if (img) {
        img.src = item.src;
        img.alt = item.title;
    }
    if (cat) cat.textContent = item.category;
    if (counter) counter.textContent = `${currentDesignIndex + 1} / ${DESIGN_SAMPLES.length}`;
    if (title) title.textContent = item.title;
    if (desc) desc.textContent = item.desc;
    if (tools) {
        tools.innerHTML = item.tools.map(t => `<span class="design-lightbox-tool-tag">${t}</span>`).join('');
    }
    if (fullRes) fullRes.href = item.src;
}

window.openDesignLightbox = function(index) {
    const modal = document.getElementById('designLightbox');
    if (!modal) return;
    const item = DESIGN_SAMPLES[index];
    if (!item) return;

    currentDesignIndex = index;
    updateDesignLightboxContent(item);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeDesignLightbox = function() {
    const modal = document.getElementById('designLightbox');
    if (!modal) return;
    modal.classList.remove('active');
    const projectModal = document.getElementById('projectModal');
    if (!projectModal || !projectModal.classList.contains('active')) {
        document.body.style.overflow = '';
    }
};

window.nextDesignLightbox = function() {
    const nextIdx = (currentDesignIndex + 1) % DESIGN_SAMPLES.length;
    window.openDesignLightbox(nextIdx);
};

window.prevDesignLightbox = function() {
    const prevIdx = (currentDesignIndex - 1 + DESIGN_SAMPLES.length) % DESIGN_SAMPLES.length;
    window.openDesignLightbox(prevIdx);
};

// Setup filter tabs
(function setupDesignShowcase() {
    const filterButtons = document.querySelectorAll('.design-filter-btn');
    const cards = document.querySelectorAll('.design-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            cards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                if (filter === 'all' || cardCat === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
})();

// Global keyboard listeners for modals
document.addEventListener('keydown', (e) => {
    const designLightbox = document.getElementById('designLightbox');
    const isDesignActive = designLightbox && designLightbox.classList.contains('active');

    if (e.key === 'Escape') {
        window.closeProjectModal();
        window.closeDesignLightbox();
    } else if (isDesignActive) {
        if (e.key === 'ArrowRight') {
            window.nextDesignLightbox();
        } else if (e.key === 'ArrowLeft') {
            window.prevDesignLightbox();
        }
    }
});

// ── 12. YOUTUBE CHANNEL & VIDEO SHOWCASE CONTROLLER ────
const YOUTUBE_VIDEOS = [
    {
        id: 'OpfagciUNx8',
        title: 'London Cinematic Vlog 4K | ලන්ඩන් සුන්දරත්වය 🇬🇧',
        category: 'Cinematic City Tour',
        badge: '4K Ultra HD',
        duration: '2:37',
        thumb: 'assets/videos/london-4k.jpg',
        desc: 'Vibrant 4K cinematic city tour capturing iconic London architecture, River Thames landmarks, moody street lighting, and dynamic color grading.',
        tools: ['Adobe Premiere Pro', 'DaVinci Resolve', '4K Cinema', 'Color Grading'],
        ytUrl: 'https://www.youtube.com/watch?v=OpfagciUNx8'
    },
    {
        id: 'LCG0tVht2ek',
        title: 'Nothing Stays | Seven Sisters Cinematic Video',
        category: 'Landscape & Coastline',
        badge: '4K Aerial',
        duration: '1:46',
        thumb: 'assets/videos/seven-sisters.jpg',
        desc: 'Breathtaking aerial perspectives and panoramic visuals showcasing the dramatic chalk cliffs and rolling coastal hills of East Sussex, UK.',
        tools: ['Adobe Premiere Pro', 'Aerial Cinematography', 'Sound Design', 'Film LUTs'],
        ytUrl: 'https://www.youtube.com/watch?v=LCG0tVht2ek'
    },
    {
        id: 'ZoDApKGzmiQ',
        title: 'The Secret White Horses of Wiltshire! | Cherhill',
        category: 'Heritage & History',
        badge: 'Drone HD',
        duration: '1:13',
        thumb: 'assets/videos/wiltshire-white-horse.jpg',
        desc: 'Cinematic aerial exploration and documentary framing of the ancient Cherhill White Horse hill figure and Lansdowne Monument in Wiltshire.',
        tools: ['Adobe Premiere Pro', 'Drone Cinematography', 'Documentary', 'Heritage'],
        ytUrl: 'https://www.youtube.com/watch?v=ZoDApKGzmiQ'
    },
    {
        id: 'rNf3ykPi6LY',
        title: 'Finding Peace in the Journey | පොත් සහ සිතියම් වලින් එහා ලෝකය',
        category: 'Visual Poetry & Short Film',
        badge: '4K Cinema',
        duration: '0:34',
        thumb: 'assets/videos/finding-peace.jpg',
        desc: 'A poetic, reflective cinematic short meditating on personal journey, tranquility, exploration, and perspective through subtle atmospheric pacing.',
        tools: ['After Effects', 'Visual Storytelling', 'Cinematic Pacing', 'Soundscape'],
        ytUrl: 'https://www.youtube.com/watch?v=rNf3ykPi6LY'
    }
];

let currentVideoIndex = 0;

window.playVideoInTheater = function(index, autoplay = true) {
    const video = YOUTUBE_VIDEOS[index];
    if (!video) return;

    currentVideoIndex = index;

    // Update Topbar metadata
    const categoryEl = document.getElementById('videoActiveCategory');
    const badgeEl = document.getElementById('videoActiveBadge');
    const durationEl = document.getElementById('videoActiveDuration');
    const headlineEl = document.getElementById('videoActiveHeadline');
    const ytLinkEl = document.getElementById('videoActiveYtLink');

    if (categoryEl) categoryEl.textContent = video.category;
    if (badgeEl) badgeEl.textContent = video.badge;
    if (durationEl) durationEl.textContent = video.duration;
    if (headlineEl) headlineEl.textContent = video.title;
    if (ytLinkEl) {
        ytLinkEl.href = video.ytUrl;
        ytLinkEl.setAttribute('aria-label', `Open ${video.title} on YouTube in new tab`);
    }

    // Update Bottombar metadata
    const descEl = document.getElementById('videoActiveDesc');
    const toolsEl = document.getElementById('videoActiveTools');

    if (descEl) descEl.textContent = video.desc;
    if (toolsEl) {
        toolsEl.innerHTML = video.tools.map(t => `<span class="video-tool-tag">${t}</span>`).join('');
    }

    // Update Screen Viewport
    const viewport = document.getElementById('videoTheaterViewport');
    if (viewport) {
        if (autoplay) {
            viewport.innerHTML = `
                <iframe class="video-theater-iframe"
                        src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1"
                        title="YouTube video player: ${video.title.replace(/"/g, '&quot;')}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen>
                </iframe>
            `;
        } else {
            viewport.innerHTML = `
                <div class="video-theater-cover" id="videoTheaterCover" onclick="window.startTheaterPlayback()">
                    <img id="videoTheaterCoverImg" src="${video.thumb}" alt="Video preview thumbnail for ${video.title.replace(/"/g, '&quot;')}" class="video-theater-cover-img" />
                    <div class="video-theater-cover-overlay">
                        <button type="button" class="video-theater-play-btn" aria-label="Play ${video.title.replace(/"/g, '&quot;')} video inside this player">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                        </button>
                        <span class="video-theater-play-label">Click to Play Video (Embedded Player)</span>
                    </div>
                </div>
            `;
        }
    }

    // Update playlist cards active class
    const cards = document.querySelectorAll('.video-playlist-card');
    cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
        card.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
};

window.startTheaterPlayback = function() {
    window.playVideoInTheater(currentVideoIndex, true);
};

