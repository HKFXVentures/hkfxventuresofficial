/* ============================================================
   HK FX VENTURES — SITE SCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Show success message after FormSubmit redirects back ---------- */
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('applied') === 'true') {
    const successBox = document.getElementById('formSuccess');
    if (successBox) {
      successBox.classList.add('visible');
      setTimeout(() => {
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
    // Clean the URL so refreshing doesn't keep showing the message
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  /* ---------- Scroll progress bar ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + '%';
  }

  /* ---------- Navbar scrolled state ---------- */
  const navbar = document.getElementById('navbar');
  function updateNavbar() {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }

  /* ---------- Back to top button ---------- */
  const backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (window.scrollY > 600) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateNavbar();
    updateBackToTop();
  }, { passive: true });
  updateScrollProgress(); updateNavbar(); updateBackToTop();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', false);
    });
  });

  /* ---------- Cursor glow (desktop only) ---------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Animated counters (Results section) ---------- */
  const counters = document.querySelectorAll('.result-value');
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterIO.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Seat progress ring ---------- */
  const SEATS_TOTAL = 50;
  const SEATS_FILLED = 33; // update as enrollment grows
  const ringFill = document.getElementById('seatRingFill');
  const seatsFilledNum = document.getElementById('seatsFilledNum');
  const seatsRemaining = document.getElementById('seatsRemaining');
  const CIRCUMFERENCE = 2 * Math.PI * 96; // r = 96

  if (ringFill) ringFill.style.strokeDasharray = CIRCUMFERENCE;
  if (seatsRemaining) seatsRemaining.textContent = SEATS_TOTAL - SEATS_FILLED;

  function animateSeatRing() {
    const fraction = SEATS_FILLED / SEATS_TOTAL;
    const offset = CIRCUMFERENCE * (1 - fraction);
    requestAnimationFrame(() => { ringFill.style.strokeDashoffset = offset; });

    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      seatsFilledNum.textContent = Math.round(SEATS_FILLED * progress);
      if (progress < 1) requestAnimationFrame(tick);
      else seatsFilledNum.textContent = SEATS_FILLED;
    }
    requestAnimationFrame(tick);
  }
  const ringWrap = document.querySelector('.seat-ring-wrap');
  if (ringWrap && 'IntersectionObserver' in window) {
    const ringIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateSeatRing(); ringIO.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    ringIO.observe(ringWrap);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.accordion-trigger').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        t.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Form validation + AJAX submit (enrollment form) ---------- */
  const enrollForm = document.getElementById('enrollForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  if (enrollForm) {
    enrollForm.addEventListener('submit', (e) => {
      let valid = true;
      enrollForm.querySelectorAll('[required]').forEach(input => {
        const field = input.closest('.field');
        const filled = input.type === 'checkbox' ? input.checked : input.value.trim().length > 0;
        const emailOk = input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

        if (!filled || !emailOk) {
          field.classList.add('invalid');
          valid = false;
        } else {
          field.classList.remove('invalid');
        }
      });

      if (!valid) {
        e.preventDefault();
        enrollForm.querySelector('.invalid input, .invalid select, .invalid textarea')?.focus();
        return;
      }

      // Let the browser submit the form normally to FormSubmit.
      // This is intentional: FormSubmit needs a real page navigation (not a
      // hidden background request) to reliably trigger its one-time email
      // activation step and to show its own confirmation/error page.
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    });
  }

  /* ---------- Animated candlestick hero background ---------- */
  const canvas = document.getElementById('candleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, dpr;
    let candles = [];
    let offset = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateCandles();
    }

    function generateCandles() {
      candles = [];
      const candleWidth = 26;
      const count = Math.ceil(width / candleWidth) + 4;
      let price = height * 0.55;

      for (let i = 0; i < count; i++) {
        const volatility = height * 0.09;
        const trend = Math.sin(i * 0.18) * 2.2;
        const open = price;
        const close = open + (Math.random() - 0.48) * volatility + trend;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        price = close;

        candles.push({
          x: i * candleWidth,
          open, close, high, low,
          bullish: close <= open // canvas y grows downward, so "close <= open" reads as price up
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const candleWidth = 26;
      const bodyWidth = 14;

      candles.forEach(c => {
        const x = c.x - offset;
        if (x < -candleWidth || x > width + candleWidth) return;

        const color = c.bullish ? 'rgba(0, 200, 83, 0.55)' : 'rgba(229, 57, 53, 0.6)';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.4;

        // wick
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, c.high);
        ctx.lineTo(x + candleWidth / 2, c.low);
        ctx.stroke();

        // body
        const top = Math.min(c.open, c.close);
        const bodyHeight = Math.max(Math.abs(c.close - c.open), 2);
        ctx.fillRect(x + (candleWidth - bodyWidth) / 2, top, bodyWidth, bodyHeight);
      });
    }

    function loop() {
      if (!reduceMotion) {
        offset += 0.35;
        const candleWidth = 26;
        if (offset > candleWidth) {
          offset -= candleWidth;
          candles.shift();
          const last = candles[candles.length - 1];
          const volatility = height * 0.09;
          const open = last.close;
          const close = open + (Math.random() - 0.48) * volatility;
          const high = Math.max(open, close) + Math.random() * volatility * 0.5;
          const low = Math.min(open, close) - Math.random() * volatility * 0.5;
          candles.push({
            x: last.x + candleWidth,
            open, close, high, low,
            bullish: close <= open
          });
        }
      }
      draw();
      requestAnimationFrame(loop);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    loop();
  }

});
