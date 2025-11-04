// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

// Smooth active link highlighting on scroll (optimized)
const links = [...document.querySelectorAll('.nav a')];
const sections = links
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

let sectionMeta = sections.map(sec => ({ id: sec.id, top: 0 }));
let ticking = false;
let lastY = window.scrollY || 0;

function computePositions() {
  // Cache section top positions for faster scroll handling
  sectionMeta = sections.map(sec => ({
    id: sec.id,
    top: Math.round(window.scrollY + sec.getBoundingClientRect().top)
  }));
}

function setActiveLink() {
  const y = window.scrollY + 140; // offset to account for header height
  let current = sectionMeta[0]?.id;
  for (const s of sectionMeta) {
    if (s.top <= y) current = s.id; else break;
  }
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      // set scroll direction on <html> for CSS-based timing control
      const y = window.scrollY;
      const html = document.documentElement;
      if (y > lastY + 2) {
        html.classList.add('scrolling-down');
        html.classList.remove('scrolling-up');
      } else if (y < lastY - 2) {
        html.classList.add('scrolling-up');
        html.classList.remove('scrolling-down');
      }
      lastY = y;

      setActiveLink();
      ticking = false;
    });
  }
}

// Passive scroll listener for better performance
document.addEventListener('scroll', onScroll, { passive: true });

// Compute positions on load and when resizing (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    computePositions();
    setActiveLink();
  }, 150);
});

window.addEventListener('load', () => {
  computePositions();
  setActiveLink();
});

// IntersectionObserver reveal animations
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer = !prefersReduced
  ? new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -20% 0px',
      threshold: 0.15
    })
  : null;

document.querySelectorAll('.reveal').forEach(el => observer?.observe(el));

// Close mobile nav when clicking a link
links.forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Certificate lightbox
const lb = document.getElementById('lightbox');
const lbImg = lb?.querySelector('.lightbox-img');
const lbCaption = lb?.querySelector('.lightbox-caption');
const lbClose = lb?.querySelector('.lightbox-close');

document.querySelectorAll('.cert-img').forEach(img => {
  img.addEventListener('click', () => {
    if (!lb || !lbImg || !lbCaption) return;
    lbImg.src = img.src;
    lbCaption.textContent = img.getAttribute('data-caption') || img.alt || '';
    lb.classList.remove('hidden');
    lb.setAttribute('aria-hidden', 'false');
  });
});

lbClose?.addEventListener('click', () => {
  lb?.classList.add('hidden');
  lb?.setAttribute('aria-hidden', 'true');
});

lb?.addEventListener('click', (e) => {
  if (e.target === lb) {
    lb.classList.add('hidden');
    lb.setAttribute('aria-hidden', 'true');
  }
});