/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — Apple-style Parallax & Interactions
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, n) => a + (b - a) * n;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const map = (v, a1, b1, a2, b2) => a2 + ((v - a1) / (b1 - a1)) * (b2 - a2);

/* ────────────────────────────────────────────────────────────────
   LOADER
──────────────────────────────────────────────────────────────── */
(function initLoader() {
  const loader = qs('#loader');
  if (!loader) return;

  const hide = () => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    startAnimations();
  };

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    setTimeout(hide, 1800);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 1800));
  }
})();

/* ────────────────────────────────────────────────────────────────
   HERO PARTICLES
──────────────────────────────────────────────────────────────── */
function initParticles() {
  const container = qs('#heroParticles');
  if (!container) return;

  const count = 18;
  const colors = [
    'rgba(110,86,207,',
    'rgba(255,107,107,',
    'rgba(200,169,110,',
    'rgba(255,255,255,',
  ];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'hero__particle';

    const size = Math.random() * 5 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = (Math.random() * 8 + 5).toFixed(1);
    const delay = (Math.random() * -10).toFixed(1);
    const tx = (Math.random() * 80 - 40).toFixed(0);
    const ty = (Math.random() * 80 - 40).toFixed(0);

    el.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${x}%;
      top:${y}%;
      background:${color}0.6);
      box-shadow:0 0 ${size * 4}px ${color}0.4);
      --dur:${dur}s;
      --delay:${delay}s;
      --tx:${tx}px;
      --ty:${ty}px;
    `;
    el.style.animationDelay = `${delay}s`;
    container.appendChild(el);
  }
}

/* ────────────────────────────────────────────────────────────────
   CUSTOM CURSOR
──────────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor = qs('#cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) {
    if (cursor) cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  const dot  = qs('.cursor__dot',  cursor);
  const ring = qs('.cursor__ring', cursor);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let raf = null;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = `${mx}px`;
    dot.style.top  = `${my}px`;
  });

  const hoverables = 'a, button, .btn, .project, .discipline-card, .social-link, .nav__menu, .footer__back';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  const animateRing = () => {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = `${rx}px`;
    ring.style.top  = `${ry}px`;
    raf = requestAnimationFrame(animateRing);
  };
  animateRing();
}

/* ────────────────────────────────────────────────────────────────
   PARALLAX ENGINE
──────────────────────────────────────────────────────────────── */
function initParallax() {
  const layers  = qsa('[data-parallax]');
  const inners  = qsa('[data-parallax-inner]');
  let scrollY   = window.scrollY;
  let ticking   = false;

  const update = () => {
    scrollY = window.scrollY;

    // Outer layers (full-section bg elements)
    layers.forEach(el => {
      const speed  = parseFloat(el.dataset.parallax) || 0;
      const parent = el.closest('section') || el.parentElement;
      const rect   = parent.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const offset = centerY - window.innerHeight / 2;
      const y = offset * speed;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    });

    // Inner parallax (project media)
    inners.forEach(el => {
      const speed = parseFloat(el.dataset.parallaxInner) || 0;
      const rect  = el.closest('.project').getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!isVisible) return;
      const centerY = rect.top + rect.height / 2 - window.innerHeight / 2;
      const y = centerY * speed;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* ────────────────────────────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
──────────────────────────────────────────────────────────────── */
function initReveal() {
  const revealEls = qsa('.reveal-up, .reveal-scale');

  // Set delays from data-delay attribute
  revealEls.forEach(el => {
    const delay = el.dataset.delay;
    if (delay) {
      el.style.transitionDelay = `${delay}ms`;
    }
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
}

/* ────────────────────────────────────────────────────────────────
   COUNTER ANIMATION
──────────────────────────────────────────────────────────────── */
function initCounters() {
  const counters = qsa('[data-count]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const startTime = performance.now();
    const suffix = el.dataset.suffix || (target >= 100 ? '+' : '+');

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

/* ────────────────────────────────────────────────────────────────
   NAV — Scroll State + Smooth Scroll
──────────────────────────────────────────────────────────────── */
function initNav() {
  const nav = qs('#nav');
  if (!nav) return;

  let lastScrollY = 0;
  let hidden = false;

  const onScroll = () => {
    const sy = window.scrollY;

    // Add glass effect after scroll
    if (sy > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Hide/show on scroll direction
    if (sy > lastScrollY + 10 && sy > 200 && !hidden) {
      nav.style.transform = 'translateY(-100%)';
      hidden = true;
    } else if (sy < lastScrollY - 10 && hidden) {
      nav.style.transform = 'translateY(0)';
      hidden = false;
    }

    lastScrollY = sy;
  };

  nav.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), background 0.4s, backdrop-filter 0.4s, border-color 0.4s';
  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth scroll for nav links
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = qs(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ────────────────────────────────────────────────────────────────
   HERO PARALLAX ON MOUSEMOVE
──────────────────────────────────────────────────────────────── */
function initHeroMouseParallax() {
  const hero = qs('#hero');
  if (!hero) return;

  const layer1 = qs('.hero__bg-layer--1', hero);
  const layer2 = qs('.hero__bg-layer--2', hero);

  let mx = 0, my = 0;
  let cx = 0, cy = 0;
  let raf;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    my = ((e.clientY - rect.top ) / rect.height - 0.5) * 2;
  });

  hero.addEventListener('mouseleave', () => {
    mx = 0; my = 0;
  });

  const animate = () => {
    cx = lerp(cx, mx, 0.06);
    cy = lerp(cy, my, 0.06);

    if (layer1) layer1.style.transform = `translate3d(${cx * 20}px, ${cy * 15}px, 0)`;
    if (layer2) layer2.style.transform = `translate3d(${cx * -12}px, ${cy * -8}px, 0)`;

    raf = requestAnimationFrame(animate);
  };

  animate();
}

/* ────────────────────────────────────────────────────────────────
   PROJECT TILT EFFECT
──────────────────────────────────────────────────────────────── */
function initProjectTilt() {
  const projects = qsa('.project');

  projects.forEach(project => {
    let mx = 0, my = 0, cx = 0, cy = 0;
    let raf = null;
    let active = false;

    project.addEventListener('mousemove', e => {
      const rect = project.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      my = ((e.clientY - rect.top ) / rect.height - 0.5) * 2;
    });

    project.addEventListener('mouseenter', () => {
      active = true;
      if (!raf) animateTilt();
    });

    project.addEventListener('mouseleave', () => {
      active = false;
      mx = 0; my = 0;
    });

    const animateTilt = () => {
      cx = lerp(cx, mx, 0.08);
      cy = lerp(cy, my, 0.08);

      const rx = cy * -4;
      const ry = cx * 4;

      project.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;

      if (!active && Math.abs(cx) < 0.001 && Math.abs(cy) < 0.001) {
        project.style.transform = '';
        raf = null;
        return;
      }
      raf = requestAnimationFrame(animateTilt);
    };
  });
}

/* ────────────────────────────────────────────────────────────────
   TEXT SCRAMBLE for hero title
──────────────────────────────────────────────────────────────── */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    return new Promise(resolve => {
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to   = newText[i] || '';
        const start = Math.floor(Math.random() * 12);
        const end   = start + Math.floor(Math.random() * 12);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.resolve = resolve;
      this.update();
    });
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="opacity:0.5;color:var(--c-accent)">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

/* ────────────────────────────────────────────────────────────────
   MARQUEE — Pause on hover
──────────────────────────────────────────────────────────────── */
function initMarquee() {
  const strip = qs('.marquee-strip');
  const track = qs('.marquee-track');
  if (!strip || !track) return;

  strip.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  strip.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
}

/* ────────────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
──────────────────────────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    background: linear-gradient(90deg, #6e56cf, #ff6b6b);
    z-index: 10000;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrolled / max;
    bar.style.transform = `scaleX(${progress})`;
  }, { passive: true });
}

/* ────────────────────────────────────────────────────────────────
   GRADIENT MESH CANVAS (hero subtle animation)
──────────────────────────────────────────────────────────────── */
function initGradientCanvas() {
  const hero = qs('#hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.35;
    z-index: 1;
    mix-blend-mode: screen;
  `;
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  let w, h, t = 0;

  const resize = () => {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const blobs = [
    { x: 0.3, y: 0.4, r: 0.35, vx: 0.0003, vy: 0.0002, color: [110, 86, 207] },
    { x: 0.7, y: 0.3, r: 0.30, vx: -0.0002, vy: 0.0003, color: [255, 107, 107] },
    { x: 0.5, y: 0.7, r: 0.25, vx: 0.0002, vy: -0.0004, color: [200, 169, 110] },
  ];

  const draw = () => {
    t++;
    ctx.clearRect(0, 0, w, h);

    blobs.forEach(b => {
      b.x += Math.sin(t * b.vx * 60) * 0.001;
      b.y += Math.cos(t * b.vy * 60) * 0.001;
      b.x = clamp(b.x, 0.1, 0.9);
      b.y = clamp(b.y, 0.1, 0.9);

      const grd = ctx.createRadialGradient(
        b.x * w, b.y * h, 0,
        b.x * w, b.y * h, b.r * Math.min(w, h)
      );
      const [r, g, bb] = b.color;
      grd.addColorStop(0, `rgba(${r},${g},${bb},0.5)`);
      grd.addColorStop(1, `rgba(${r},${g},${bb},0)`);

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(b.x * w, b.y * h, b.r * Math.min(w, h), 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  draw();
}

/* ────────────────────────────────────────────────────────────────
   SECTION TITLE SPLIT ANIMATION
──────────────────────────────────────────────────────────────── */
function initSplitText() {
  // Animate section titles character by character on intersect
  const titles = qsa('.section-title');

  titles.forEach(title => {
    const text = title.innerHTML;
    if (title.dataset.split) return;
    title.dataset.split = true;

    // Only wrap if no child elements (no <br> etc issues)
    const lines = title.innerHTML.split('<br>');
    if (lines.length > 1) {
      title.innerHTML = lines.map(l =>
        `<span style="display:block;overflow:hidden"><span class="split-line">${l}</span></span>`
      ).join('');
    }
  });

  const splitLines = qsa('.split-line');
  splitLines.forEach(line => {
    line.style.cssText = 'display:block;transform:translateY(100%);transition:transform 0.8s cubic-bezier(0.16,1,0.3,1);';
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const lines = qsa('.split-line', entry.target);
      lines.forEach((line, i) => {
        setTimeout(() => {
          line.style.transform = 'translateY(0)';
        }, i * 120);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  titles.forEach(t => observer.observe(t));
}

/* ────────────────────────────────────────────────────────────────
   DISCIPLINE CARDS — stagger on scroll
──────────────────────────────────────────────────────────────── */
function initCardStagger() {
  const grid = qs('.disciplines__grid');
  if (!grid) return;

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    const cards = qsa('.discipline-card', grid);
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 80}ms`;
    });
    observer.unobserve(grid);
  }, { threshold: 0.1 });

  observer.observe(grid);
}

/* ────────────────────────────────────────────────────────────────
   ABOUT PHOTO — floating animation
──────────────────────────────────────────────────────────────── */
function initPhotoFloat() {
  const photo = qs('.about__photo-frame');
  if (!photo) return;

  let t = 0;
  const animate = () => {
    t += 0.008;
    const y = Math.sin(t) * 10;
    const r = Math.sin(t * 0.7) * 1.5;
    photo.style.transform = `translateY(${y}px) rotate(${r}deg)`;
    requestAnimationFrame(animate);
  };
  animate();
}

/* ────────────────────────────────────────────────────────────────
   RESIZE HANDLER
──────────────────────────────────────────────────────────────── */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Re-run any resize-sensitive logic
  }, 150);
});

/* ────────────────────────────────────────────────────────────────
   INIT ALL AFTER LOADER
──────────────────────────────────────────────────────────────── */
function startAnimations() {
  initParticles();
  initCursor();
  initParallax();
  initReveal();
  initCounters();
  initNav();
  initHeroMouseParallax();
  initProjectTilt();
  initMarquee();
  initScrollProgress();
  initGradientCanvas();
  initSplitText();
  initCardStagger();
  initPhotoFloat();

  // Hero content — staggered entrance
  const heroLines = qsa('.hero__title-line');
  heroLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(60px)';
    line.style.transition = `opacity 1s cubic-bezier(0.16,1,0.3,1) ${(i * 0.14) + 0.3}s,
                              transform 1s cubic-bezier(0.16,1,0.3,1) ${(i * 0.14) + 0.3}s`;
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
    }, 50);
  });

  // Hero other elements
  const heroReveal = qsa('.hero__content .reveal-up');
  heroReveal.forEach(el => {
    const d = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), d + 200);
  });

  console.log('%c Portfolio Loaded ✦', 'color:#6e56cf;font-size:1.2rem;font-weight:bold;');
}

/* ────────────────────────────────────────────────────────────────
   KEYBOARD NAVIGATION accessibility
──────────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

/* Add focus styles only for keyboard nav */
const style = document.createElement('style');
style.textContent = `
  .keyboard-nav *:focus {
    outline: 2px solid #6e56cf !important;
    outline-offset: 4px !important;
  }
`;
document.head.appendChild(style);
