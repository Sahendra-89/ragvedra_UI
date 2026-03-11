/* ============================================================
   RAGHU NETWORKS — Script
   Handles: Particles, Cursor, Nav, Scroll Reveals, Parallax
   ============================================================ */

'use strict';

/* ---- Config ---- */
const CONFIG = {
    particleCount: window.innerWidth < 768 ? 60 : 140,
    particleSpeed: 0.18,
    particleOpacityRange: [0.15, 0.55],
    particleSizeRange: [0.4, 2.2],
};

/* ============================================================
   INIT on DOM Ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    initCustomCursor();
    initNavbar();
    initScrollReveals();
    initParallaxOrbs();
    initContactForm();
});

/* ============================================================
   1. PARTICLE CANVAS
   ============================================================ */
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    const particles = [];
    const COLORS = ['#00f2ff', '#7b2fff', '#ff00d4', '#ffffff'];

    class Particle {
        constructor() { this.reset(true); }
        reset(init = false) {
            this.x = Math.random() * W;
            this.y = init ? Math.random() * H : H + 5;
            this.size = rand(...CONFIG.particleSizeRange);
            this.vx = (Math.random() - 0.5) * CONFIG.particleSpeed;
            this.vy = -CONFIG.particleSpeed * (0.3 + Math.random() * 0.7);
            this.opacity = rand(...CONFIG.particleOpacityRange);
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.life = 0;
            this.maxLife = 400 + Math.random() * 600;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            // Wrap horizontally
            if (this.x < -5) this.x = W + 5;
            if (this.x > W + 5) this.x = -5;
            // Reset when out of top
            if (this.y < -5 || this.life > this.maxLife) this.reset();
        }
        draw() {
            const alpha = this.opacity * Math.sin((this.life / this.maxLife) * Math.PI);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
        }
    }

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function buildParticles() {
        particles.length = 0;
        const count = window.innerWidth < 768 ? 60 : 140;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) {
            p.update();
            p.draw();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => { resize(); buildParticles(); });
    resize();
    buildParticles();
    loop();
}

/* ============================================================
   2. CUSTOM CURSOR (desktop only)
   ============================================================ */
function initCustomCursor() {
    if (window.innerWidth < 768) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    const LAG = 0.12;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * LAG;
        ringY += (mouseY - ringY) * LAG;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover detection
    const interactives = document.querySelectorAll(
        'a, button, .feature-card, .gallery-card, .tech-card, input, textarea, select, .social-btn'
    );

    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
    });

    document.addEventListener('mousedown', () => ring.classList.add('is-clicking'));
    document.addEventListener('mouseup', () => ring.classList.remove('is-clicking'));
}

/* ============================================================
   3. NAVBAR â€” scroll class + active link + mobile menu
   ============================================================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    /* Scroll class */
    const onScroll = () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveLink();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Active link highlight */
    function updateActiveLink() {
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (window.scrollY >= top) current = sec.id;
        });
        links.forEach(l => {
            l.classList.remove('active-link');
            if (l.getAttribute('href') === '#' + current) l.classList.add('active-link');
        });
    }

    /* Mobile toggle */
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const isOpen = toggle.classList.toggle('is-open');
            navLinks.classList.toggle('is-open', isOpen);
        });

        links.forEach(l => {
            l.addEventListener('click', () => {
                toggle.classList.remove('is-open');
                navLinks.classList.remove('is-open');
            });
        });
    }
}

/* ============================================================
   4. SCROLL REVEALS (IntersectionObserver)
   ============================================================ */
function initScrollReveals() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;

            setTimeout(() => {
                el.classList.add('is-visible');
            }, delay);

            observer.unobserve(el);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px',
    });

    elements.forEach(el => observer.observe(el));
}

/* ============================================================
   5. PARALLAX â€” Hero orbs follow mouse
   ============================================================ */
function initParallaxOrbs() {
    if (window.innerWidth < 900) return;
    const orbs = document.querySelectorAll('.hero-orb');

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', e => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateOrbs() {
        currentX += (targetX - currentX) * 0.04;
        currentY += (targetY - currentY) * 0.04;

        orbs.forEach((orb, i) => {
            const depth = (i + 1) * 25;
            orb.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
        });

        requestAnimationFrame(animateOrbs);
    }

    animateOrbs();
}

/* ============================================================
   6. CONTACT FORM
   ============================================================ */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formWrap = document.querySelector('.contact-form-wrap');
    const success = document.getElementById('formSuccess');

    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();

        // Basic validation
        const required = form.querySelectorAll('[required]');
        let valid = true;
        required.forEach(field => {
            field.style.borderColor = '';
            if (!field.value.trim()) {
                field.style.borderColor = '#ff4060';
                valid = false;
            }
        });

        if (!valid) {
            shakeForm(form);
            return;
        }

        // Loading state
        form.classList.add('is-loading');
        submitBtn.disabled = true;

        await delay(1800);

        // Success UI
        form.style.display = 'none';
        success.classList.add('is-visible');
        formWrap.querySelector('h3').style.display = 'none';
    });
}

function shakeForm(el) {
    el.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-8px)' },
        { transform: 'translateX(8px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
    ], { duration: 400, easing: 'ease-in-out' });
}

function rand(min, max) { return min + Math.random() * (max - min); }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

