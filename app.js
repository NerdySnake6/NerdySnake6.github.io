// ============================================================
// app.js - Рендеринг и интерактивность
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
    phone: '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92z"/></svg>',
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

  function appendTextElement(parent, tag, className, text) {
    const element = el(tag, className);
    element.textContent = text || '';
    parent.appendChild(element);
    return element;
  }

  function appendExternalLink(parent, link) {
    if (!link || !link.href || !link.label) return null;

    parent.appendChild(document.createTextNode(' '));
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    parent.appendChild(anchor);
    return anchor;
  }

  function setHeroContactLink(options) {
    const { elementId, iconId, textId, icon, text, href, external } = options;
    const element = document.getElementById(elementId);
    const iconElement = document.getElementById(iconId);
    const textElement = document.getElementById(textId);
    const hasValue = Boolean(text);

    element.hidden = !hasValue;
    if (!hasValue) return false;

    iconElement.innerHTML = icon;
    textElement.textContent = text;
    element.href = href;

    if (external) {
      element.target = '_blank';
      element.rel = 'noopener';
    } else {
      element.removeAttribute('target');
      element.removeAttribute('rel');
    }

    return true;
  }

  function setHeroContactText(options) {
    const { elementId, iconId, textId, icon, text } = options;
    const element = document.getElementById(elementId);
    const iconElement = document.getElementById(iconId);
    const textElement = document.getElementById(textId);
    const hasValue = Boolean(text);

    element.hidden = !hasValue;
    if (!hasValue) return false;

    iconElement.innerHTML = icon;
    textElement.textContent = text;
    return true;
  }

  function renderHeroContacts() {
    const { contacts } = siteData;
    const contactPanel = document.getElementById('hero-contact-panel');
    const contactKicker = document.getElementById('hero-contact-kicker');

    contactKicker.textContent = contacts.title || 'Контакты';

    const hasEmail = setHeroContactLink({
      elementId: 'hero-contact-email',
      iconId: 'hero-contact-email-icon',
      textId: 'hero-contact-email-text',
      icon: icons.email,
      text: contacts.email,
      href: contacts.email ? `mailto:${contacts.email}` : ''
    });

    const hasGithub = setHeroContactLink({
      elementId: 'hero-contact-github',
      iconId: 'hero-contact-github-icon',
      textId: 'hero-contact-github-text',
      icon: icons.github,
      text: contacts.github ? `@${contacts.github}` : '',
      href: contacts.githubUrl || '',
      external: true
    });

    const hasTelegram = setHeroContactLink({
      elementId: 'hero-contact-telegram',
      iconId: 'hero-contact-telegram-icon',
      textId: 'hero-contact-telegram-text',
      icon: icons.telegram,
      text: contacts.telegram ? `@${contacts.telegram}` : '',
      href: contacts.telegram ? `https://t.me/${contacts.telegram}` : '',
      external: true
    });

    const hasPhone = setHeroContactLink({
      elementId: 'hero-contact-phone',
      iconId: 'hero-contact-phone-icon',
      textId: 'hero-contact-phone-text',
      icon: icons.phone,
      text: contacts.phone,
      href: contacts.phone ? `tel:${contacts.phone.replace(/[^\d+]/g, '')}` : ''
    });

    const hasLocation = setHeroContactText({
      elementId: 'hero-contact-location',
      iconId: 'hero-contact-location-icon',
      textId: 'hero-contact-location-text',
      icon: icons.location,
      text: contacts.location
    });

    contactPanel.hidden = !(hasEmail || hasGithub || hasTelegram || hasPhone || hasLocation);
  }

  // ----------------------------------------------------------
  // RENDER: Navigation
  // ----------------------------------------------------------
  function renderNav() {
    const { hero, nav } = siteData;
    document.getElementById('nav-logo').textContent = hero.name.split(' ')[0];

    const linksList = document.getElementById('nav-links');
    const mobileNavQuery = window.matchMedia('(max-width: 768px)');

    function syncNavState() {
      const isOpen = linksList.classList.contains('nav__links--open');
      const shouldHideLinks = mobileNavQuery.matches && !isOpen;

      linksList.inert = shouldHideLinks;
      linksList.setAttribute('aria-hidden', shouldHideLinks ? 'true' : 'false');
      toggle.classList.toggle('nav__toggle--open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    }

    function closeMobileNav() {
      linksList.classList.remove('nav__links--open');
      syncNavState();
    }

    nav.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.addEventListener('click', closeMobileNav);
      li.appendChild(a);
      linksList.appendChild(li);
    });

    // Mobile toggle
    const toggle = document.getElementById('nav-toggle');
    toggle.setAttribute('aria-controls', 'nav-links');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      linksList.classList.toggle('nav__links--open');
      syncNavState();
    });

    if (typeof mobileNavQuery.addEventListener === 'function') {
      mobileNavQuery.addEventListener('change', syncNavState);
    } else {
      mobileNavQuery.addListener(syncNavState);
    }
    syncNavState();

  }

  // ----------------------------------------------------------
  // RENDER: Hero
  // ----------------------------------------------------------
  function renderHero() {
    const { hero } = siteData;

    document.getElementById('hero-greeting').textContent = 'Здравствуйте, меня зовут';
    document.getElementById('hero-name').textContent = hero.name;
    document.getElementById('hero-role').textContent = hero.role;
    const educationElement = document.getElementById('hero-education');
    const educationLineElement = document.getElementById('hero-education-line');
    const educationProfileElement = document.getElementById('hero-education-profile');
    educationLineElement.textContent = hero.educationLine || '';
    educationProfileElement.textContent = hero.educationProfile || '';
    educationElement.hidden = !(hero.educationLine || hero.educationProfile);
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
    renderHeroContacts();

    const highlightsContainer = document.getElementById('hero-highlights');
    hero.highlights.forEach(h => {
      const div = el('div', 'hero__highlight');
      appendTextElement(div, 'span', 'hero__highlight-label', h.label);
      appendTextElement(div, 'span', 'hero__highlight-desc', h.description);
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

    skills.items.forEach(skill => {
      const card = el('div', 'skill-card');
      appendTextElement(card, 'div', 'skill-card__category', skill.category);

      const techs = el('div', 'skill-card__techs');
      skill.technologies.forEach(technology => {
        appendTextElement(techs, 'span', 'skill-card__tech', technology);
      });
      card.appendChild(techs);

      appendTextElement(card, 'p', 'skill-card__desc', skill.description);
      grid.appendChild(card);
    });
  }

  // ----------------------------------------------------------
  // RENDER: Projects
  // ----------------------------------------------------------
  function renderProjects() {
    const { projects } = siteData;
    document.getElementById('projects-title').textContent = projects.title;

    const list = document.getElementById('projects-list');

    projects.items.forEach(proj => {
      const project = el('div', 'project');

      const header = el('div', 'project__header');
      if (proj.badge) {
        appendTextElement(header, 'div', 'project__badge', proj.badge);
      }
      appendTextElement(header, 'h3', 'project__title', proj.title);
      appendTextElement(header, 'p', 'project__task', proj.task);
      project.appendChild(header);

      const details = el('div', 'project__details');
      const toolsDetail = document.createElement('div');
      appendTextElement(toolsDetail, 'div', 'project__detail-label', 'Инструменты');

      const tools = el('div', 'project__tools');
      proj.tools.forEach(tool => {
        appendTextElement(tools, 'span', 'project__tool', tool);
      });
      toolsDetail.appendChild(tools);
      details.appendChild(toolsDetail);

      const workDetail = document.createElement('div');
      appendTextElement(workDetail, 'div', 'project__detail-label', 'Что сделано');
      appendTextElement(workDetail, 'p', 'project__detail-value', proj.work);
      details.appendChild(workDetail);
      project.appendChild(details);

      const result = el('div', 'project__result');
      appendTextElement(result, 'span', 'project__result-icon', '→');

      const resultText = el('p', 'project__result-text');
      resultText.textContent = proj.result || '';
      appendExternalLink(resultText, proj.link);
      result.appendChild(resultText);
      project.appendChild(result);

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

    certificates.items.forEach(cert => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'certificate';
      card.setAttribute('aria-label', `Открыть сертификат: ${cert.title}`);

      const imageContainer = el('div', 'certificate__image');
      if (cert.image) {
        const image = document.createElement('img');
        image.src = cert.image;
        image.alt = cert.title;
        imageContainer.appendChild(image);
      }
      card.appendChild(imageContainer);

      const info = el('div', 'certificate__info');
      appendTextElement(info, 'div', 'certificate__title', cert.title);
      appendTextElement(info, 'div', 'certificate__meta', `${cert.issuer || ''}${cert.year ? ' · ' + cert.year : ''}`);
      card.appendChild(info);

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
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    let lastFocusedElement = null;
    let hiddenBackgroundElements = [];

    function setBackgroundInert(isInert) {
      if (isInert) {
        hiddenBackgroundElements = [...document.body.children]
          .filter(child => child !== modal && child.tagName !== 'SCRIPT')
          .map(element => ({
            element,
            ariaHidden: element.getAttribute('aria-hidden'),
            inert: element.inert
          }));

        hiddenBackgroundElements.forEach(({ element }) => {
          element.inert = true;
          element.setAttribute('aria-hidden', 'true');
        });
        return;
      }

      hiddenBackgroundElements.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) {
          element.removeAttribute('aria-hidden');
        } else {
          element.setAttribute('aria-hidden', ariaHidden);
        }
      });
      hiddenBackgroundElements = [];
    }

    function trapFocus(event) {
      if (event.key !== 'Tab' || !modal.classList.contains('certificate-modal--open')) {
        return;
      }

      const focusableElements = [...modal.querySelectorAll(focusableSelector)]
        .filter(element => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function close() {
      modal.classList.remove('certificate-modal--open');
      document.body.classList.remove('modal-open');
      setBackgroundInert(false);
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
      setBackgroundInert(true);

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

      trapFocus(event);
    });

    certificateModal = { open, close };
  }

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
    renderProjects();
    renderCertificates();
    renderFooter();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
