// ============================================
// CYBERSECURITY PORTFOLIO - MAIN JAVASCRIPT
// Pure JS - No Dependencies
// ============================================

// Prevent errors in browsers without IntersectionObserver
if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver not supported');
}

// Mobile Menu Toggle
(function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('navMenu');

    if (toggleBtn && menu) {
        toggleBtn.addEventListener('click', () => {
            toggleBtn.classList.toggle('active');
            menu.classList.toggle('active');
            toggleBtn.setAttribute('aria-expanded', 
                toggleBtn.classList.contains('active') ? 'true' : 'false'
            );
        });

        // Close menu on link click
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggleBtn.classList.remove('active');
                menu.classList.remove('active');
                toggleBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }
})();

// Reveal elements on scroll
(function setupScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
})();

// Smooth scroll navigation
(function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
})();

// Boot screen
(function setupBootScreen() {
    window.addEventListener('load', () => {
        const bootScreen = document.getElementById('bootScreen');
        if (bootScreen) {
            const hideBootScreen = () => {
                bootScreen.style.opacity = '0';
                bootScreen.style.pointerEvents = 'none';
                setTimeout(() => {
                    bootScreen.remove();
                }, 500);
            };

            setTimeout(hideBootScreen, 3000);
            document.addEventListener('click', hideBootScreen, { once: true });
            document.addEventListener('keydown', hideBootScreen, { once: true });
            document.addEventListener('touchstart', hideBootScreen, { once: true });
        }
    });
})();

// Navbar active link
(function setupNavbarActive() {
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    const style = document.createElement('style');
    style.textContent = `.nav-link.active { color: #ffffff !important; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important; }`;
    document.head.appendChild(style);
})();

// Skill bars animation
(function setupSkillBars() {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fillSkill 1s ease-out forwards';
                skillObserver.unobserve(entry.target);
            }
        });
    });

    const style = document.createElement('style');
    style.textContent = `@keyframes fillSkill { from { width: 0 !important; } to { width: inherit !important; } }`;
    document.head.appendChild(style);

    document.querySelectorAll('.skill-progress').forEach(bar => {
        skillObserver.observe(bar);
    });
})();

// Form submission
(function setupFormSubmission() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        if (!nameInput || !emailInput || !messageInput) return;

        // Sanitize inputs
        const name = nameInput.value.trim().substring(0, 100);
        const email = emailInput.value.trim().substring(0, 254);
        const message = messageInput.value.trim().substring(0, 1000);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            emailInput.focus();
            return;
        }

        // Validate name length
        if (name.length < 2) {
            alert('Please enter a valid name (at least 2 characters)');
            nameInput.focus();
            return;
        }

        // Validate message length
        if (message.length < 5) {
            alert('Message must be at least 5 characters');
            messageInput.focus();
            return;
        }

        // Prevent script injection - check for suspicious content
        const suspiciousPatterns = /<script|javascript:|on\w+\s*=/gi;
        if (suspiciousPatterns.test(name) || suspiciousPatterns.test(message)) {
            alert('Invalid content detected. Please check your input.');
            return;
        }

        // Update button state
        const button = contactForm.querySelector('button');
        const originalText = button.textContent;
        button.textContent = 'Sending...';
        button.disabled = true;

        // Simulate sending (replace with actual backend call if needed)
        setTimeout(() => {
            button.textContent = 'Message Sent ✓';
            button.style.backgroundColor = '#ffffff';
            button.style.color = '#000000';

            setTimeout(() => {
                contactForm.reset();
                button.textContent = originalText;
                button.style.backgroundColor = '';
                button.style.color = '';
                button.disabled = false;
            }, 2000);
        }, 1000);
    }, { passive: false });
})();


// Code copy functionality
(function setupCodeCopy() {
    document.querySelectorAll('.hero-code pre').forEach(codeBlock => {
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.style.cssText = 'position: absolute; top: 5px; right: 5px; padding: 5px 10px; background-color: #ffffff; color: #000000; border: 1px solid #ffffff; border-radius: 3px; cursor: pointer; font-size: 12px; z-index: 10;';
        
        codeBlock.parentElement.style.position = 'relative';
        codeBlock.parentElement.appendChild(copyButton);

        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        });
    });
})();

// Timeline animations
(function setupTimeline() {
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.animation = `fadeInUp 0.8s ease-out ${index * 0.2}s both`;
    });
})();

// Certificate cards tilt (desktop only)
(function setupCertCards() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (!isMobile) {
        document.querySelectorAll('.cert-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const rotateX = (e.clientY - rect.top - rect.height / 2) / 10;
                const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 10;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }
})();

// Parallax effect (desktop only)
(function setupParallax() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (!isMobile) {
        window.addEventListener('scroll', () => {
            const hero = document.querySelector('.hero');
            if (hero && window.scrollY < hero.offsetHeight + hero.offsetTop) {
                hero.style.transform = `translateY(${window.scrollY * 0.5}px)`;
            }
        }, { passive: true });
    }
})();

// Grid animations
(function setupGridAnimations() {
    const gridObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('div[class*="-category"], div[class*="-card"]');
                items.forEach((item, index) => {
                    item.style.animation = `fadeInUp 0.8s ease-out ${index * 0.1}s both`;
                });
                gridObserver.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.skills-grid, .projects-grid').forEach(grid => {
        gridObserver.observe(grid);
    });
})();

// Scroll progress bar
(function setupProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'position: fixed; top: 0; left: 0; height: 2px; background: linear-gradient(90deg, #ffffff, #666666); z-index: 999; width: 0%;';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
})();

// Boot screen prevention on revisit
(function setupBootScreenPrevention() {
    if (!sessionStorage.getItem('bootScreenShown')) {
        sessionStorage.setItem('bootScreenShown', 'true');
    } else {
        const bootScreen = document.getElementById('bootScreen');
        if (bootScreen) {
            bootScreen.remove();
        }
    }
})();

// Lazy loading
(function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    lazyObserver.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll('section').forEach(section => {
            lazyObserver.observe(section);
        });
    }
})();

// Visibility change handler
(function setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.body.style.animationPlayState = 'paused';
        } else {
            document.body.style.animationPlayState = 'running';
        }
    });
})();

// Page fade transitions
(function setupPageTransitions() {
    window.addEventListener('beforeunload', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-out';
    });

    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    }, { passive: true });
})();

// Error handling (silent, no console exposure)
(function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        // Don't expose errors in console - just handle silently
        if (e.target && e.target !== window) {
            // Could send to analytics service if needed
        }
    }, { passive: true });
})();

// Security: Disable right-click in production (optional)
// Uncomment if you want to prevent copying source code
// document.addEventListener('contextmenu', (e) => e.preventDefault());

// Initialize (silent initialization)
(function initialize() {
    // Initialization complete - no console logging for security
})();
