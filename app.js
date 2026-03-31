// ============================================================
// app.js — Рендеринг и интерактивность
// Читает данные из data.js и наполняет HTML
// ============================================================

(function () {
  'use strict';

  let certificateModal;

  // ----------------------------------------------------------
  // SVG Icons (inline to avoid external dependencies)
  // ----------------------------------------------------------
  const icons = {
    email: '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    telegram: '<svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    location: '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  };

  // ----------------------------------------------------------
  // Utility: create element with class
  // ----------------------------------------------------------
  function el(tag, className, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // ----------------------------------------------------------
  // RENDER: Navigation
  // ----------------------------------------------------------
  function renderNav() {
    const { hero, nav } = siteData;
    document.getElementById('nav-logo').textContent = hero.name.split(' ')[0];

    const linksList = document.getElementById('nav-links');
    nav.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.addEventListener('click', () => {
        document.getElementById('nav-links').classList.remove('nav__links--open');
      });
      li.appendChild(a);
      linksList.appendChild(li);
    });

    // Mobile toggle
    const toggle = document.getElementById('nav-toggle');
    toggle.addEventListener('click', () => {
      linksList.classList.toggle('nav__links--open');
    });

  }

  // ----------------------------------------------------------
  // RENDER: Hero
  // ----------------------------------------------------------
  function renderHero() {
    const { hero } = siteData;

    document.getElementById('hero-greeting').textContent = 'Здравствуйте, меня зовут';
    document.getElementById('hero-name').textContent = hero.name;
    document.getElementById('hero-role').textContent = hero.role;
    document.getElementById('hero-tagline').textContent = hero.tagline;

    // Initials for placeholder
    const initials = hero.name.split(' ').map(w => w[0]).join('');
    document.getElementById('hero-initials').textContent = initials;

    // Try to load photo
    const photoContainer = document.getElementById('hero-photo');
    if (hero.photo) {
      const img = new Image();
      img.src = hero.photo;
      img.alt = hero.name;
      img.onload = function () {
        document.getElementById('hero-initials').style.display = 'none';
        photoContainer.appendChild(img);
      };
    }

    // Highlights
    const highlightsContainer = document.getElementById('hero-highlights');
    hero.highlights.forEach(h => {
      const div = el('div', 'hero__highlight');
      div.innerHTML = `
        <span class="hero__highlight-label">${h.label}</span>
        <span class="hero__highlight-desc">${h.description}</span>
      `;
      highlightsContainer.appendChild(div);
    });

    // Trigger hero animation
    requestAnimationFrame(() => {
      document.getElementById('hero').classList.add('hero--visible');
    });
  }

  // ----------------------------------------------------------
  // RENDER: About
  // ----------------------------------------------------------
  function renderAbout() {
    const { about } = siteData;
    document.getElementById('about-title').textContent = about.title;

    const textContainer = document.getElementById('about-text');
    about.paragraphs.forEach(p => {
      const para = document.createElement('p');
      para.textContent = p;
      textContainer.appendChild(para);
    });
  }

  // ----------------------------------------------------------
  // RENDER: Skills
  // ----------------------------------------------------------
  function renderSkills() {
    const { skills } = siteData;
    document.getElementById('skills-title').textContent = skills.title;

    const grid = document.getElementById('skills-grid');
    grid.classList.add('reveal-children');

    skills.items.forEach(skill => {
      const card = el('div', 'skill-card');
      card.innerHTML = `
        <div class="skill-card__category">${skill.category}</div>
        <div class="skill-card__techs">
          ${skill.technologies.map(t => `<span class="skill-card__tech">${t}</span>`).join('')}
        </div>
        <p class="skill-card__desc">${skill.description}</p>
      `;
      grid.appendChild(card);
    });
  }

  // ----------------------------------------------------------
  // RENDER: Achievements
  // ----------------------------------------------------------
  function renderAchievements() {
    const { achievements } = siteData;
    document.getElementById('achievements-title').textContent = achievements.title;

    const list = document.getElementById('achievements-list');
    list.classList.add('reveal-children');

    achievements.items.forEach(item => {
      const achievement = el('div', 'achievement');
      achievement.innerHTML = `
        <div class="achievement__year">${item.year}</div>
        <div class="achievement__body">
          <h3 class="achievement__title">${item.title}</h3>
          <p class="achievement__desc">${item.description}</p>
          ${item.result ? `<span class="achievement__result">${item.result}</span>` : ''}
        </div>
      `;
      list.appendChild(achievement);
    });
  }

  // ----------------------------------------------------------
  // RENDER: Projects
  // ----------------------------------------------------------
  function renderProjects() {
    const { projects } = siteData;
    document.getElementById('projects-title').textContent = projects.title;

    const list = document.getElementById('projects-list');
    list.classList.add('reveal-children');

    projects.items.forEach(proj => {
      const project = el('div', 'project');
      project.innerHTML = `
        <div class="project__header">
          <h3 class="project__title">${proj.title}</h3>
          <p class="project__task">${proj.task}</p>
        </div>
        <div class="project__details">
          <div>
            <div class="project__detail-label">Инструменты</div>
            <div class="project__tools">
              ${proj.tools.map(t => `<span class="project__tool">${t}</span>`).join('')}
            </div>
          </div>
          <div>
            <div class="project__detail-label">Что сделано</div>
            <p class="project__detail-value">${proj.work}</p>
          </div>
        </div>
        <div class="project__result">
          <span class="project__result-icon">→</span>
          <p class="project__result-text">${proj.result}</p>
        </div>
      `;
      list.appendChild(project);
    });
  }

  // ----------------------------------------------------------
  // RENDER: Certificates
  // ----------------------------------------------------------
  function renderCertificates() {
    const { certificates } = siteData;
    document.getElementById('certificates-title').textContent = certificates.title;

    const grid = document.getElementById('certificates-grid');
    const emptyMsg = document.getElementById('certificates-empty');

    if (!certificates.items || certificates.items.length === 0) {
      emptyMsg.style.display = 'block';
      grid.style.display = 'none';
      return;
    }

    grid.classList.add('reveal-children');

    certificates.items.forEach(cert => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'certificate';
      card.setAttribute('aria-label', `Открыть сертификат: ${cert.title}`);
      card.innerHTML = `
        <div class="certificate__image">
          ${cert.image ? `<img src="${cert.image}" alt="${cert.title}">` : ''}
        </div>
        <div class="certificate__info">
          <div class="certificate__title">${cert.title}</div>
          <div class="certificate__meta">${cert.issuer || ''}${cert.year ? ' · ' + cert.year : ''}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        if (certificateModal) {
          certificateModal.open(cert);
        }
      });
      grid.appendChild(card);
    });
  }

  // ----------------------------------------------------------
  // CERTIFICATE MODAL
  // ----------------------------------------------------------
  function initCertificateModal() {
    const modal = el('div', 'certificate-modal');
    modal.setAttribute('hidden', '');
    modal.innerHTML = `
      <div class="certificate-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-modal-title">
        <button type="button" class="certificate-modal__close" aria-label="Закрыть окно">&times;</button>
        <div class="certificate-modal__image-wrap">
          <img class="certificate-modal__image" alt="">
        </div>
        <div class="certificate-modal__info">
          <div class="certificate-modal__title" id="certificate-modal-title"></div>
          <div class="certificate-modal__meta"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.certificate-modal__close');
    const image = modal.querySelector('.certificate-modal__image');
    const title = modal.querySelector('.certificate-modal__title');
    const meta = modal.querySelector('.certificate-modal__meta');
    let lastFocusedElement = null;

    function close() {
      modal.classList.remove('certificate-modal--open');
      document.body.classList.remove('modal-open');
      modal.setAttribute('hidden', '');
      image.removeAttribute('src');

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    function open(cert) {
      lastFocusedElement = document.activeElement;
      title.textContent = cert.title || '';
      meta.textContent = `${cert.issuer || ''}${cert.year ? ' · ' + cert.year : ''}`.replace(/^ · | · $/g, '');
      image.src = cert.image || '';
      image.alt = cert.title || 'Сертификат';
      modal.removeAttribute('hidden');
      document.body.classList.add('modal-open');

      requestAnimationFrame(() => {
        modal.classList.add('certificate-modal--open');
      });

      closeButton.focus();
    }

    closeButton.addEventListener('click', close);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        close();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('certificate-modal--open')) {
        close();
      }
    });

    certificateModal = { open, close };
  }

  // ----------------------------------------------------------
  // RENDER: Contacts
  // ----------------------------------------------------------
  function renderContacts() {
    const { contacts } = siteData;
    document.getElementById('contacts-title').textContent = contacts.title;

    const content = document.getElementById('contacts-content');
    const items = [];

    if (contacts.email) {
      items.push({
        icon: icons.email,
        label: 'Email',
        value: `<a href="mailto:${contacts.email}">${contacts.email}</a>`
      });
    }

    if (contacts.github) {
      items.push({
        icon: icons.github,
        label: 'GitHub',
        value: `<a href="${contacts.githubUrl}" target="_blank" rel="noopener">@${contacts.github}</a>`
      });
    }

    if (contacts.telegram) {
      items.push({
        icon: icons.telegram,
        label: 'Telegram',
        value: `<a href="https://t.me/${contacts.telegram}" target="_blank" rel="noopener">@${contacts.telegram}</a>`
      });
    }

    if (contacts.location) {
      items.push({
        icon: icons.location,
        label: 'Местоположение',
        value: contacts.location
      });
    }

    items.forEach(item => {
      const div = el('div', 'contact-item');
      div.innerHTML = `
        <div class="contact-item__icon">${item.icon}</div>
        <div>
          <div class="contact-item__label">${item.label}</div>
          <div class="contact-item__value">${item.value}</div>
        </div>
      `;
      content.appendChild(div);
    });
  }

  // ----------------------------------------------------------
  // RENDER: Footer
  // ----------------------------------------------------------
  function renderFooter() {
    const year = new Date().getFullYear();
    document.getElementById('footer-copy').textContent = `© ${year} ${siteData.hero.name}`;
  }

  // ----------------------------------------------------------
  // INIT
  // ----------------------------------------------------------
  function init() {
    initCertificateModal();
    renderNav();
    renderHero();
    renderAbout();
    renderSkills();
    renderAchievements();
    renderProjects();
    renderCertificates();
    renderContacts();
    renderFooter();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
