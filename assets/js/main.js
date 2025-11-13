'use strict';

// Register GSAP plugins
if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// Simple HTML partials loader
async function loadPartials() {
  const containers = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(containers).map(async (el) => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
      const html = await res.text();
      // Insert as siblings to preserve structure (replace wrapper div with content)
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const fragment = document.createDocumentFragment();
      while (temp.firstChild) fragment.appendChild(temp.firstChild);
      el.replaceWith(fragment);
    } catch (err) {
      console.error(err);
      el.innerHTML = `<div style="color:#b00">Error loading ${url}</div>`;
    }
  }));
}

function initializeAnimations() {
  if (!window.gsap) return;
  const heroTimeline = gsap.timeline();
  heroTimeline
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' })
    .to('.hero-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, '-=0.7')
    .to('.hero-date', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.8')
    .to('.hero-description', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.6')
    .to('.cta-buttons', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.4');

  gsap.to('.floating-element', {
    y: -30, rotation: 5, duration: 3, repeat: -1, yoyo: true, ease: 'power2.inOut', stagger: 0.5
  });

  gsap.utils.toArray('.fade-in').forEach((element) => {
    gsap.fromTo(element, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' }
    });
  });

  gsap.utils.toArray('.scale-in').forEach((element) => {
    gsap.fromTo(element, { opacity: 0, scale: 0.8 }, {
      opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: element, start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' }
    });
  });

  gsap.utils.toArray('.timeline-marker').forEach((marker) => {
    gsap.fromTo(marker, { scale: 0 }, {
      scale: 1, duration: 0.5, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: marker, start: 'top 80%', toggleActions: 'play none none reverse' }
    });
  });

  // Parallax effect for hero section
  gsap.to('.hero::before', {
    yPercent: -50, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  // Refresh ScrollTrigger once content is in the DOM
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}

function initializeUI() {
  // Navbar scroll effect
  window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 100) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
  });

  // Smooth scrolling for navigation links
  const delegate = (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  document.addEventListener('click', delegate);

  // Mobile menu toggle
  const bindMobileMenu = () => {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenu && navLinks) {
      const toggle = () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
      };
      mobileMenu.addEventListener('click', toggle);
      mobileMenu.addEventListener('keypress', (e) => { if (e.key === 'Enter') toggle(); });
    }
  };
  bindMobileMenu();

  // Active link on scroll
  window.addEventListener('scroll', function () {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-links a');
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 200) current = section.getAttribute('id');
    });
    links.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });

  // Button hover effects
  const attachBtnHover = () => {
    document.querySelectorAll('.btn').forEach((button) => {
      button.addEventListener('mouseenter', function () { if (window.gsap) gsap.to(this, { scale: 1.05, duration: 0.2 }); });
      button.addEventListener('mouseleave', function () { if (window.gsap) gsap.to(this, { scale: 1, duration: 0.2 }); });
    });
  };
  attachBtnHover();

  // Typing effect for hero title
  function typeWriter(element, text, speed = 100) {
    let i = 0; element.innerHTML = '';
    (function type() {
      if (i < text.length) { element.innerHTML += text.charAt(i); i++; setTimeout(type, speed); }
    })();
  }
  setTimeout(() => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && heroTitle.textContent) {
      const originalText = heroTitle.textContent;
      typeWriter(heroTitle, originalText, 100);
    }
  }, 3000);
}

// Loading screen control and boot sequence
window.addEventListener('load', async function () {
  const loadingScreen = document.getElementById('loadingScreen');
  await loadPartials();
  // Once partials are in DOM, init UI and animations
  initializeUI();

  setTimeout(() => {
    if (window.gsap && loadingScreen) {
      gsap.to(loadingScreen, {
        opacity: 0, duration: 0.5,
        onComplete: () => { loadingScreen.style.display = 'none'; initializeAnimations(); }
      });
    } else if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }, 2000);
});
