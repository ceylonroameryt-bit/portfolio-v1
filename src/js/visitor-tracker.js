/**
 * Cyber Visitor Intelligence & Telemetry Tracker
 * Captures visitor source, geographic region, device info, and engagement actions.
 * Stored locally in localStorage for private viewing inside admin.html.
 */
(function initVisitorTracker() {
    'use strict';

    const STORAGE_KEY = 'cyber_visitor_logs';
    const VID_KEY = 'cyber_vid';
    const SID_KEY = 'cyber_sid';
    const GEO_CACHE_KEY = 'cyber_geo_cache';
    const WEBHOOK_KEY = 'cyber_webhook_url';
    const MAX_LOGS = 200;

    // Helper: Generate random ID
    function generateId(prefix) {
        return prefix + '_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    }

    // 1. Persistent Visitor ID & Session ID
    let visitorId = localStorage.getItem(VID_KEY);
    if (!visitorId) {
        visitorId = generateId('vid');
        localStorage.setItem(VID_KEY, visitorId);
    }

    let isNewSession = false;
    let sessionId = sessionStorage.getItem(SID_KEY);
    if (!sessionId) {
        sessionId = generateId('sid');
        sessionStorage.setItem(SID_KEY, sessionId);
        isNewSession = true;
    }

    // 2. Detect Referrer & Campaign
    function parseReferrer() {
        const ref = document.referrer || '';
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source') || urlParams.get('ref') || urlParams.get('source');
        const utmCampaign = urlParams.get('utm_campaign');

        let category = 'Direct / Bookmark';
        let detail = ref || 'Direct';

        if (utmSource) {
            category = 'Campaign (' + utmSource + ')';
            detail = utmCampaign ? `${utmSource} / ${utmCampaign}` : utmSource;
        } else if (ref.includes('linkedin.com') || ref.includes('lnkd.in')) {
            category = 'LinkedIn Recruiter / Network';
        } else if (ref.includes('github.com')) {
            category = 'GitHub';
        } else if (ref.includes('google.')) {
            category = 'Google Search';
        } else if (ref.includes('bing.') || ref.includes('yahoo.')) {
            category = 'Search Engine';
        } else if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) {
            category = 'Twitter / X';
        } else if (ref.includes('youtube.com')) {
            category = 'YouTube';
        } else if (ref) {
            try {
                const host = new URL(ref).hostname;
                category = host;
            } catch (e) {
                category = 'External Link';
            }
        }

        return { category, detail, raw: ref };
    }

    // 3. Detect Device, OS & Browser
    function parseDevice() {
        const ua = navigator.userAgent || '';
        let deviceType = 'Desktop';
        if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
        if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';

        let os = 'Unknown OS';
        if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
        else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/Linux/i.test(ua)) os = 'Linux';

        let browser = 'Unknown Browser';
        if (/Edg\//i.test(ua)) browser = 'Edge';
        else if (/Chrome\//i.test(ua)) browser = 'Chrome';
        else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
        else if (/Firefox\//i.test(ua)) browser = 'Firefox';

        return {
            type: deviceType,
            os: os,
            browser: browser,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language || 'en'
        };
    }

    // Get current logs
    function getLogs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveLogs(logs) {
        try {
            if (logs.length > MAX_LOGS) logs = logs.slice(0, MAX_LOGS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            console.warn('[Visitor Tracker] localStorage full');
        }
    }

    // Current Session State
    let currentLog = null;
    const startTime = Date.now();
    let maxScroll = 0;
    const recordedActions = new Set();

    // Find or initialize session log
    const existingLogs = getLogs();
    const existingIndex = existingLogs.findIndex(l => l.sessionId === sessionId);

    if (existingIndex >= 0) {
        currentLog = existingLogs[existingIndex];
        if (currentLog.actions) {
            currentLog.actions.forEach(a => recordedActions.add(a));
        }
    } else {
        const referrerInfo = parseReferrer();
        const deviceInfo = parseDevice();
        currentLog = {
            id: generateId('log'),
            sessionId: sessionId,
            visitorId: visitorId,
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleString(),
            referrer: referrerInfo,
            device: deviceInfo,
            location: {
                city: 'Detecting...',
                country: 'Detecting...',
                countryCode: '',
                org: '',
                ip: ''
            },
            durationSeconds: 0,
            maxScrollDepth: 0,
            actions: ['Landed on Portfolio']
        };
        existingLogs.unshift(currentLog);
        saveLogs(existingLogs);
    }

    // Helper: update existing session log
    function updateCurrentLog() {
        if (!currentLog) return;
        currentLog.durationSeconds = Math.round((Date.now() - startTime) / 1000);
        currentLog.maxScrollDepth = maxScroll;
        currentLog.actions = Array.from(recordedActions);

        const logs = getLogs();
        const idx = logs.findIndex(l => l.sessionId === sessionId);
        if (idx >= 0) {
            logs[idx] = currentLog;
            saveLogs(logs);
        }
    }

    // 4. Fetch Geolocation (Cached in sessionStorage per visit)
    async function fetchGeoLocation() {
        const cachedGeo = sessionStorage.getItem(GEO_CACHE_KEY);
        if (cachedGeo) {
            try {
                const geo = JSON.parse(cachedGeo);
                applyGeo(geo);
                return;
            } catch (e) {}
        }

        try {
            // Fast, non-blocking free IP lookup
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                const geoData = {
                    city: data.city || 'Unknown City',
                    region: data.region || '',
                    country: data.country_name || 'Unknown Country',
                    countryCode: data.country_code || '',
                    org: data.org || data.asn || '',
                    ip: data.ip || ''
                };
                sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geoData));
                applyGeo(geoData);
                return;
            }
        } catch (e) {
            // Fallback provider if ipapi is rate-limited or blocked
            try {
                const res2 = await fetch('https://ipwho.is/');
                if (res2.ok) {
                    const data2 = await res2.json();
                    if (data2.success) {
                        const geoData2 = {
                            city: data2.city || 'Unknown City',
                            region: data2.region || '',
                            country: data2.country || 'Unknown Country',
                            countryCode: data2.country_code || '',
                            org: data2.connection ? data2.connection.org : '',
                            ip: data2.ip || ''
                        };
                        sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geoData2));
                        applyGeo(geoData2);
                        return;
                    }
                }
            } catch (e2) {}
        }

        // If both fail / offline
        applyGeo({
            city: 'Direct / Local',
            country: 'Global',
            countryCode: '',
            org: '',
            ip: ''
        });
    }

    function applyGeo(geo) {
        if (!currentLog) return;
        currentLog.location = geo;
        updateCurrentLog();

        // If new session and webhook configured, trigger notification
        if (isNewSession) {
            sendWebhookNotification('New Visitor', `👁️ **New Portfolio Visitor**\n📍 **Location**: ${geo.city}, ${geo.country} (${geo.org || 'ISP'})\n🔗 **Source**: ${currentLog.referrer.category}\n💻 **Device**: ${currentLog.device.os} · ${currentLog.device.browser}`);
        }
    }

    // 5. Track Actions & Interactions
    function trackAction(actionName) {
        if (!recordedActions.has(actionName)) {
            recordedActions.add(actionName);
            updateCurrentLog();

            // Critical alerts
            if (actionName.includes('Downloaded CV')) {
                const loc = currentLog && currentLog.location ? `${currentLog.location.city}, ${currentLog.location.country}` : 'Unknown Location';
                sendWebhookNotification('CV Downloaded!', `🎯 **CV Downloaded** by visitor from **${loc}**!\n🔗 Referrer: ${currentLog.referrer.category}`);
            }
        }
    }

    // 6. Optional Webhook Dispatcher
    function sendWebhookNotification(title, message) {
        const webhookUrl = localStorage.getItem(WEBHOOK_KEY);
        if (!webhookUrl || !webhookUrl.startsWith('http')) return;

        try {
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: message,
                    username: 'Poorna Portfolio Bot',
                    embeds: [{
                        title: title,
                        description: message,
                        color: title.includes('CV') ? 0x00c96e : 0x3b82f6,
                        timestamp: new Date().toISOString()
                    }]
                })
            }).catch(() => {});
        } catch (e) {}
    }

    // Event Listeners for Clicks
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a, button');
        if (!target) return;

        const href = target.getAttribute('href') || '';
        const download = target.getAttribute('download');

        if (download || href.includes('Poorna_CV.pdf') || href.includes('CV.pdf')) {
            trackAction('📥 Downloaded CV (Poorna_CV.pdf)');
        } else if (href.includes('linkedin.com')) {
            trackAction('💼 Clicked LinkedIn Profile');
        } else if (href.startsWith('mailto:')) {
            trackAction('✉️ Clicked Email Contact');
        } else if (href.includes('the-digital-watch') || href.includes('behind-the-breach') || href.includes('#blog')) {
            trackAction('📖 Explored Cyber Insight Blog');
        } else if (href.includes('github.com')) {
            trackAction('🐙 Visited GitHub');
        } else if (href.includes('#projects')) {
            trackAction('🛠️ Explored Projects Section');
        } else if (href.includes('#experience')) {
            trackAction('🛡️ Viewed SOC Experience');
        } else if (href.includes('#certifications')) {
            trackAction('📜 Viewed Certifications');
        }
    });

    // Scroll depth tracking
    let scrollThrottle = false;
    window.addEventListener('scroll', function() {
        if (scrollThrottle) return;
        scrollThrottle = true;
        setTimeout(() => { scrollThrottle = false; }, 400);

        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) return;
        const currentScroll = Math.min(100, Math.round((window.scrollY / totalHeight) * 100));

        if (currentScroll > maxScroll) {
            maxScroll = currentScroll;
            if (maxScroll >= 75) trackAction('📜 Scrolled 75%+ of Portfolio');
            else if (maxScroll >= 50) trackAction('📜 Scrolled 50%+ of Portfolio');
        }
    }, { passive: true });

    // Periodic & on-unload duration update
    setInterval(updateCurrentLog, 10000);
    window.addEventListener('beforeunload', updateCurrentLog);
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') updateCurrentLog();
    });

    // Initialize geolocation query asynchronously
    fetchGeoLocation();

    // Expose utility for admin debugging
    window.CyberTracker = {
        getLogs: getLogs,
        clearLogs: function() {
            localStorage.removeItem(STORAGE_KEY);
            return 'Logs cleared';
        },
        simulateVisit: function(mockCity, mockRef) {
            const mockLog = {
                id: generateId('mock'),
                sessionId: generateId('msid'),
                visitorId: generateId('mvid'),
                timestamp: new Date().toISOString(),
                dateFormatted: new Date().toLocaleString(),
                referrer: { category: mockRef || 'LinkedIn Recruiter', detail: 'Recruiter Search', raw: 'https://linkedin.com' },
                device: { type: 'Desktop', os: 'macOS', browser: 'Chrome', screen: '1920x1080', language: 'en-GB' },
                location: { city: mockCity || 'London', country: 'United Kingdom', countryCode: 'GB', org: 'Enterprise Cybersecurity Corp', ip: '185.x.x.x' },
                durationSeconds: 145,
                maxScrollDepth: 90,
                actions: ['Landed on Portfolio', '🛡️ Viewed SOC Experience', '📥 Downloaded CV (Poorna_CV.pdf)']
            };
            const l = getLogs();
            l.unshift(mockLog);
            saveLogs(l);
            return 'Simulated visit created';
        }
    };
})();
