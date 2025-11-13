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
async function fetchSiteData() {
  try {
    const res = await fetch('/assets/data/site.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load site.json: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

function renderHero(data) {
  if (!data?.hero) return;
  const { subtitle, title, date, description, ctas } = data.hero;
  const root = document.querySelector('#home');
  if (!root) return;
  const sub = root.querySelector('.hero-subtitle');
  const h1 = root.querySelector('.hero-title');
  const d = root.querySelector('.hero-date');
  const desc = root.querySelector('.hero-description');
  const ctaWrap = root.querySelector('.cta-buttons');
  if (sub) sub.textContent = subtitle || '';
  if (h1) h1.textContent = title || '';
  if (d) d.textContent = date || '';
  if (desc) desc.textContent = description || '';
  if (ctaWrap && Array.isArray(ctas)) {
    ctaWrap.innerHTML = '';
    ctas.forEach((cta) => {
      const a = document.createElement('a');
      a.href = cta.href || '#';
      a.className = `btn ${cta.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`;
      a.innerHTML = `${cta.icon ? `<i class="fas ${cta.icon}"></i> ` : ''}${cta.label || ''}`;
      ctaWrap.appendChild(a);
    });
  }
}

function renderTimeline(data) {
  if (!data?.timeline) return;
  const { title, description, events } = data.timeline;
  const section = document.querySelector('#timeline');
  if (!section) return;
  const titleEl = section.querySelector('.section-title');
  const descEl = section.querySelector('.section-description');
  if (titleEl) titleEl.textContent = title || '';
  if (descEl) descEl.textContent = description || '';
  const container = section.querySelector('.timeline');
  if (!container || !Array.isArray(events)) return;
  container.innerHTML = events.map((ev, idx) => `
    <div class="timeline-item fade-in">
      <div class="timeline-content">
        <div class="timeline-date">${ev.time || ''}</div>
        <h3 class="timeline-title">${ev.title || ''}</h3>
        <p class="timeline-description">${ev.description || ''}</p>
      </div>
      <div class="timeline-marker"></div>
    </div>
  `).join('');
}

function renderMenu(data) {
  if (!data?.menu) return;
  const { title, description, cards } = data.menu;
  const section = document.querySelector('#menu');
  if (!section) return;
  const titleEl = section.querySelector('.section-title');
  const descEl = section.querySelector('.section-description');
  if (titleEl) titleEl.textContent = title || '';
  if (descEl) descEl.textContent = description || '';
  const grid = section.querySelector('.menu-grid');
  if (!grid || !Array.isArray(cards)) return;
  grid.innerHTML = cards.map(card => `
    <div class="menu-card scale-in">
      <div class="menu-card-header">
        <h3 class="menu-card-title">${card.title || ''}</h3>
        <p class="menu-card-subtitle">${card.subtitle || ''}</p>
      </div>
      ${Array.isArray(card.categories) ? card.categories.map(cat => `
        <div class="menu-category">
          <h4 class="menu-category-title">${cat.title || ''}</h4>
          <ul class="menu-items">
            ${(cat.items || []).map(it => `<li>${it}</li>`).join('')}
          </ul>
        </div>
      `).join('') : ''}
    </div>
  `).join('');
}

function renderRooms(data) {
  if (!data?.rooms) return;
  const { title, description, sections, notes } = data.rooms;
  const section = document.querySelector('#rooms');
  if (!section) return;
  const titleEl = section.querySelector('.section-title');
  const descEl = section.querySelector('.section-description');
  if (titleEl) titleEl.textContent = title || '';
  if (descEl) descEl.textContent = description || '';
  const grid = section.querySelector('.room-grid');
  if (grid && Array.isArray(sections)) {
    grid.innerHTML = sections.map(sec => `
      <div class="room-section fade-in">
        <h3 class="room-section-title">${sec.title || ''}</h3>
        <ul class="room-list">
          ${(sec.rooms || []).map(r => `
            <li><span class="room-number">${r.number}:</span> ${r.label}${r.type ? ` <span class="room-type">(${r.type})</span>` : ''}</li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  }
  // Notes block
  const oldNotes = Array.from(section.querySelectorAll('.section-header')).slice(1);
  oldNotes.forEach(n => n.remove());
  if (Array.isArray(notes) && notes.length) {
    const wrapper = document.createElement('div');
    wrapper.className = 'section-header fade-in';
    wrapper.style.marginTop = '3rem';
    wrapper.innerHTML = `
      <h3 style="color: var(--primary-gold); margin-bottom: 1rem;">Important Notes</h3>
      <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: left; max-width: 600px; margin: 0 auto;">
        <ul style="list-style: disc; padding-left: 2rem; color: var(--text-dark);">
          ${notes.map(n => `<li>${n}</li>`).join('')}
        </ul>
      </div>
    `;
    section.appendChild(wrapper);
  }
}

function renderFooter(data) {
  if (!data?.contact) return;
  const { dates, map, phones } = data.contact;
  const footer = document.querySelector('footer#contact');
  if (!footer) return;
  const info = footer.querySelector('.contact-info');
  if (!info) return;
  const items = [];
  if (dates) {
    items.push(`<div class="contact-item"><i class="fas fa-calendar-alt"></i><span>${dates}</span></div>`);
  }
  if (map?.url) {
    items.push(`<div class="contact-item"><i class="fas fa-map-marker-alt"></i><a class="map-link" href="${map.url}" target="_blank" rel="noopener" aria-label="Open location in Google Maps (opens in a new tab)">${map.label || 'View on Map'} <i class="fas fa-up-right-from-square icon-external" aria-hidden="true"></i></a></div>`);
  }
  (phones || []).forEach(p => {
    items.push(`<div class="contact-item"><i class="fas fa-phone"></i><a class="phone-link" href="tel:${p.tel || p.number}" aria-label="Call ${p.name}">${p.name} — ${p.number}</a></div>`);
  });
  info.innerHTML = items.join('');
}

async function renderSite() {
  const data = await fetchSiteData();
  if (!data) return;
  renderHero(data);
  renderTimeline(data);
  renderMenu(data);
  renderRooms(data);
  renderFooter(data);
}

window.addEventListener('load', async function () {
  const loadingScreen = document.getElementById('loadingScreen');
  await loadPartials();
  await renderSite();
  // Once partials + data are in DOM, init UI and animations
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
