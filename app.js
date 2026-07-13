// ============================================================
// app.js - Progressive enhancement for navigation and certificates
// ============================================================

(function () {
  'use strict';

  let certificateModal;

  function initMobileNavigation() {
    const linksList = document.getElementById('nav-links');
    const toggle = document.getElementById('nav-toggle');

    if (!linksList || !toggle) return;

    const mobileNavQuery = window.matchMedia('(max-width: 768px)');
    const openLabel = toggle.dataset.openLabel || 'Открыть меню';
    const closeLabel = toggle.dataset.closeLabel || 'Закрыть меню';

    function syncNavState() {
      const isOpen = linksList.classList.contains('nav__links--open');
      const shouldHideLinks = mobileNavQuery.matches && !isOpen;

      linksList.inert = shouldHideLinks;
      linksList.setAttribute('aria-hidden', shouldHideLinks ? 'true' : 'false');
      toggle.classList.toggle('nav__toggle--open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? closeLabel : openLabel);
    }

    function closeMobileNav() {
      linksList.classList.remove('nav__links--open');
      syncNavState();
    }

    toggle.setAttribute('aria-controls', 'nav-links');
    toggle.addEventListener('click', () => {
      linksList.classList.toggle('nav__links--open');
      syncNavState();
    });

    linksList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    if (typeof mobileNavQuery.addEventListener === 'function') {
      mobileNavQuery.addEventListener('change', syncNavState);
    } else {
      mobileNavQuery.addListener(syncNavState);
    }

    syncNavState();
  }

  function createCertificateModal() {
    const labels = document.body.dataset;
    const modal = document.createElement('div');
    modal.className = 'certificate-modal';
    modal.setAttribute('hidden', '');
    modal.innerHTML = `
      <div class="certificate-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-modal-title">
        <button type="button" class="certificate-modal__close" aria-label="${labels.modalCloseLabel || 'Закрыть окно'}">&times;</button>
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
      if (event.key !== 'Tab' || !modal.classList.contains('certificate-modal--open')) return;

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

    function open(certificate) {
      lastFocusedElement = document.activeElement;
      title.textContent = certificate.title;
      meta.textContent = certificate.meta;
      image.src = certificate.image;
      image.alt = certificate.title;
      modal.removeAttribute('hidden');
      document.body.classList.add('modal-open');
      setBackgroundInert(true);

      requestAnimationFrame(() => {
        modal.classList.add('certificate-modal--open');
      });

      closeButton.focus();
    }

    closeButton.addEventListener('click', close);
    modal.addEventListener('click', event => {
      if (event.target === modal) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal.classList.contains('certificate-modal--open')) {
        close();
      }
      trapFocus(event);
    });

    return { open, close };
  }

  function initCertificates() {
    const cards = document.querySelectorAll('.certificate[data-certificate-image]');
    if (cards.length === 0) return;

    certificateModal = createCertificateModal();
    cards.forEach(card => {
      card.addEventListener('click', () => {
        certificateModal.open({
          image: card.dataset.certificateImage,
          title: card.dataset.certificateTitle || '',
          meta: card.dataset.certificateMeta || ''
        });
      });
    });
  }

  function initFooterYear() {
    const year = document.getElementById('footer-year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function initLanguageSwitches() {
    const switches = document.querySelectorAll('[data-language-switch]');
    if (switches.length === 0) return;

    switches.forEach(link => {
      const baseHref = link.getAttribute('href');
      if (!baseHref) return;

      function syncSectionHash() {
        const target = new URL(baseHref, window.location.href);
        const sectionId = window.location.hash.slice(1);
        target.hash = sectionId && document.getElementById(sectionId) ? window.location.hash : '';
        link.setAttribute('href', `${target.pathname}${target.search}${target.hash}`);
      }

      window.addEventListener('hashchange', syncSectionHash);
      syncSectionHash();
    });
  }

  function revealHero() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    requestAnimationFrame(() => {
      hero.classList.add('hero--visible');
    });
  }

  function init() {
    initMobileNavigation();
    initCertificates();
    initFooterYear();
    initLanguageSwitches();
    revealHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
