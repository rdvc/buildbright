/* ==========================================================
   Build Bright — Animation Engine
   Works on the homepage (body.bb-home) and on system pages.
   No dependencies.
   ========================================================== */
(function () {
    'use strict';

    var doc = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isHome = document.body.classList.contains('bb-home');
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    doc.classList.add('bb-js');

    // Shared UI chrome — injected on pages that don't already include it
    function ensure(id, tag, html) {
        if (document.getElementById(id)) return;
        var el = document.createElement(tag);
        el.id = id;
        if (html) el.innerHTML = html;
        if (tag === 'button') el.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(el);
    }
    ensure('bb-progress', 'div');
    ensure('bb-top', 'button', '<i class="fas fa-arrow-up"></i>');

    /* ---------- Preloader ---------- */
    function finishLoading() {
        var pre = document.getElementById('bb-preloader');
        if (pre) pre.classList.add('done');
        doc.classList.add('bb-loaded');
        setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 800);
    }
    if (document.readyState === 'complete') finishLoading();
    else window.addEventListener('load', finishLoading);
    setTimeout(finishLoading, 3000); // never block the page for long

    /* ---------- Scroll reveal ---------- */
    function autoTag() {
        // Pages without explicit reveal markup — tag common blocks automatically
        if (!isHome && !document.querySelector('[data-reveal]')) {
            document.querySelectorAll('header > *, main section, body > section').forEach(function (el) {
                if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'up');
            });
            document.querySelectorAll('.feature-card, .contact-card, .grid > div').forEach(function (el, i) {
                el.setAttribute('data-reveal', 'zoom');
                el.style.setProperty('--d', i % 4);
            });
        }
    }
    autoTag();

    var revealEls = document.querySelectorAll('[data-reveal], .section-title');
    if ('IntersectionObserver' in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    var el = e.target;
                    el.classList.add('in');
                    setTimeout(function () { el.classList.add('bb-done'); }, 1400);
                    io.unobserve(el);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('in', 'bb-done'); });
    }

    /* ---------- Scroll: progress bar, nav state, back-to-top, active link ---------- */
    var progress = document.getElementById('bb-progress');
    var nav = document.querySelector('nav');
    var topBtn = document.getElementById('bb-top');
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('nav ul a[href^="#"]'));
    var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var ticking = false;

    function onScroll() {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
        if (nav) nav.classList.toggle('scrolled', y > 40);
        if (topBtn) topBtn.classList.toggle('show', y > 600);

        var current = -1;
        sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= 140) current = i; });
        navLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ---------- System pages: tab scrollspy + footer year ---------- */
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.sys-tabs a[href^="#"]'));
    if (tabs.length) {
        var tabTargets = tabs.map(function (a) { return document.querySelector(a.getAttribute('href')); });
        var tabTick = false;
        var spy = function () {
            var cur = -1;
            tabTargets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= 160) cur = i; });
            tabs.forEach(function (a, i) {
                var on = i === cur;
                if (on && !a.classList.contains('active') && a.scrollIntoView) {
                    a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
                }
                a.classList.toggle('active', on);
            });
            tabTick = false;
        };
        window.addEventListener('scroll', function () { if (!tabTick) { requestAnimationFrame(spy); tabTick = true; } }, { passive: true });
        spy();
    }
    document.querySelectorAll('.bb-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* ---------- Mobile menu icon animation ---------- */
    var toggle = document.getElementById('mobile-menu');
    var navList = document.getElementById('nav-list');
    if (toggle && navList) {
        var syncIcon = function () {
            var open = navList.classList.contains('active');
            toggle.classList.toggle('open', open);
            var icon = toggle.querySelector('i');
            if (icon) { icon.classList.toggle('fa-bars', !open); icon.classList.toggle('fa-times', open); }
        };
        new MutationObserver(syncIcon).observe(navList, { attributes: true, attributeFilter: ['class'] });
    }

    /* ---------- Screenshot slider ---------- */
    var slider = document.querySelector('.bb-slider');
    if (slider) {
        var slides = slider.querySelectorAll('.bb-slide');
        var thumbs = slider.querySelectorAll('.bb-thumb');
        var caption = slider.querySelector('.bb-caption');
        var capTitle = document.getElementById('bb-cap-title');
        var capDesc = document.getElementById('bb-cap-desc');
        var capLink = document.getElementById('bb-cap-link');
        var urlEl = document.getElementById('bb-slide-url');
        var DUR = 5000, cur = 0, timer = null, paused = false;
        slider.style.setProperty('--bb-dur', DUR + 'ms');

        var go = function (n, dir) {
            n = (n + slides.length) % slides.length;
            if (n === cur) return;
            var from = (dir || (n > cur ? 1 : -1)) * 40;
            slides[n].style.setProperty('--from', from + 'px');
            slides[cur].classList.remove('active');
            thumbs[cur].classList.remove('active');
            slides[n].classList.add('active');
            // restart the progress bar animation
            void thumbs[n].offsetWidth;
            thumbs[n].classList.add('active');
            var s = slides[n];
            caption.classList.add('swap');
            setTimeout(function () {
                capTitle.textContent = s.getAttribute('data-title');
                capDesc.textContent = s.getAttribute('data-desc');
                capLink.setAttribute('href', s.getAttribute('data-href'));
                caption.classList.remove('swap');
            }, 250);
            if (urlEl) urlEl.textContent = s.getAttribute('data-url');
            cur = n;
            restart();
        };
        var restart = function () {
            clearTimeout(timer);
            if (!paused && !reduceMotion) timer = setTimeout(function () { go(cur + 1, 1); }, DUR);
        };
        var setPaused = function (p) { paused = p; slider.classList.toggle('paused', p); restart(); };

        slider.querySelector('.bb-arrow.next').addEventListener('click', function () { go(cur + 1, 1); });
        slider.querySelector('.bb-arrow.prev').addEventListener('click', function () { go(cur - 1, -1); });
        thumbs.forEach(function (t, i) { t.addEventListener('click', function () { go(i); }); });
        var frame = slider.querySelector('.bb-frame');
        frame.addEventListener('mouseenter', function () { setPaused(true); });
        frame.addEventListener('mouseleave', function () { setPaused(false); });
        document.addEventListener('visibilitychange', function () { setPaused(document.hidden); });

        // keyboard when slider is on screen
        document.addEventListener('keydown', function (e) {
            var r = slider.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            if (e.key === 'ArrowRight') go(cur + 1, 1);
            if (e.key === 'ArrowLeft') go(cur - 1, -1);
        });

        // swipe
        var sx = null;
        var area = slider.querySelector('.bb-slides');
        area.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
        area.addEventListener('touchend', function (e) {
            if (sx === null) return;
            var dx = e.changedTouches[0].clientX - sx;
            if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
            sx = null;
        });

        // click the screenshot to open that system
        area.addEventListener('click', function () { window.location.href = slides[cur].getAttribute('data-href'); });
        area.style.cursor = 'pointer';

        // only start autoplay once the slider is visible
        if ('IntersectionObserver' in window) {
            var started = false;
            new IntersectionObserver(function (en) {
                if (en[0].isIntersecting && !started) { started = true; thumbs[0].classList.remove('active'); void thumbs[0].offsetWidth; thumbs[0].classList.add('active'); restart(); }
            }, { threshold: 0.3 }).observe(slider);
        } else restart();
    }

    if (reduceMotion) return; // everything below is decorative motion

    /* ---------- Cursor spotlight ---------- */
    var spot = document.getElementById('bb-spotlight');
    if (spot && finePointer) {
        window.addEventListener('mousemove', function (e) {
            spot.style.setProperty('--mx', e.clientX + 'px');
            spot.style.setProperty('--my', e.clientY + 'px');
        }, { passive: true });
    }

    /* ---------- Card glow follow + 3D tilt ---------- */
    document.querySelectorAll('.project-card, .service-card, .method-card, .feature-card').forEach(function (card) {
        var tilt = finePointer && card.classList.contains('project-card');
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            var x = e.clientX - r.left, y = e.clientY - r.top;
            card.style.setProperty('--cx', x + 'px');
            card.style.setProperty('--cy', y + 'px');
            if (tilt) {
                var rx = ((y / r.height) - 0.5) * -10;
                var ry = ((x / r.width) - 0.5) * 10;
                card.style.transform = 'translateY(-10px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
            }
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });

    /* ---------- Button ripple ---------- */
    document.querySelectorAll('.btn, .btn-outline, .sys-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            var r = btn.getBoundingClientRect();
            var size = Math.max(r.width, r.height);
            var s = document.createElement('span');
            s.className = 'bb-ripple';
            s.style.width = s.style.height = size + 'px';
            s.style.left = (e.clientX - r.left - size / 2) + 'px';
            s.style.top = (e.clientY - r.top - size / 2) + 'px';
            btn.appendChild(s);
            setTimeout(function () { s.remove(); }, 650);
        });
    });

    /* ---------- Magnetic buttons ---------- */
    if (finePointer) {
        document.querySelectorAll('.hero-btns .btn, .hero-btns .btn-outline').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var r = btn.getBoundingClientRect();
                var x = (e.clientX - r.left - r.width / 2) * 0.25;
                var y = (e.clientY - r.top - r.height / 2) * 0.35;
                btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
            });
            btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
        });
    }

    /* ---------- Typing effect ---------- */
    var typed = document.getElementById('bb-typed-text');
    if (typed) {
        var words = (typed.getAttribute('data-words') || '').split('|').filter(Boolean);
        var wi = 0, ci = 0, deleting = false;
        (function type() {
            var w = words[wi];
            ci += deleting ? -1 : 1;
            typed.textContent = w.slice(0, ci);
            var delay = deleting ? 40 : 80;
            if (!deleting && ci === w.length) { delay = 1800; deleting = true; }
            else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
            setTimeout(type, delay);
        })();
    }

    /* ---------- Count-up numbers ---------- */
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length && 'IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                var el = e.target, spec = el.getAttribute('data-count');
                // data-count="#" + selector counts matching elements, so stats stay accurate as you add systems
                var target = spec.charAt(0) === '#' ? document.querySelectorAll(spec.slice(1)).length : (parseInt(spec, 10) || 0);
                var suffix = el.getAttribute('data-suffix') || '';
                var start = performance.now(), dur = 1600;
                (function step(t) {
                    var p = Math.min((t - start) / dur, 1);
                    var eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.round(target * eased) + suffix;
                    if (p < 1) requestAnimationFrame(step);
                })(start);
                cio.unobserve(el);
            });
        }, { threshold: 0.6 });
        counters.forEach(function (c) { cio.observe(c); });
    }

    /* ---------- Hero network particles ---------- */
    var canvas = document.getElementById('bb-hero-canvas');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var W, H, pts = [], mouse = { x: -9999, y: -9999 };
        var running = true;

        function resize() {
            var r = canvas.getBoundingClientRect();
            W = r.width; H = r.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var n = Math.round(Math.min(90, (W * H) / 16000));
            pts = [];
            for (var i = 0; i < n; i++) {
                pts.push({
                    x: Math.random() * W, y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
                    r: Math.random() * 1.6 + 0.6
                });
            }
        }
        resize();
        window.addEventListener('resize', resize);
        canvas.parentElement.addEventListener('mousemove', function (e) {
            var r = canvas.getBoundingClientRect();
            mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        });
        canvas.parentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });

        // pause when hero is off-screen (saves battery)
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) {
                var vis = en[0].isIntersecting;
                if (vis && !running) { running = true; requestAnimationFrame(draw); }
                running = vis;
            }).observe(canvas);
        }

        var LINK = 130;
        function draw() {
            if (!running) return;
            ctx.clearRect(0, 0, W, H);
            for (var i = 0; i < pts.length; i++) {
                var p = pts[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                // gentle mouse attraction
                var mdx = mouse.x - p.x, mdy = mouse.y - p.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
                if (md < 180) { p.x += mdx * 0.004; p.y += mdy * 0.004; }

                for (var j = i + 1; j < pts.length; j++) {
                    var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
                    if (d < LINK * LINK) {
                        var a = 1 - Math.sqrt(d) / LINK;
                        ctx.strokeStyle = 'rgba(0,212,255,' + (a * 0.28) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                    }
                }
                if (md < 180) {
                    ctx.strokeStyle = 'rgba(139,92,246,' + ((1 - md / 180) * 0.5) + ')';
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                }
                ctx.fillStyle = 'rgba(160,230,255,0.85)';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            }
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);

        // parallax on hero content
        var heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            window.addEventListener('scroll', function () {
                var y = window.scrollY;
                if (y < window.innerHeight) {
                    heroContent.style.transform = 'translateY(' + y * 0.3 + 'px)';
                    heroContent.style.opacity = String(1 - y / (window.innerHeight * 0.9));
                }
            }, { passive: true });
        }
    }
})();
