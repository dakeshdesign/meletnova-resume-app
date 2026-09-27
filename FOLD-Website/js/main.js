/* ==========================================================================
   FOLD — CREATIVE STUDIO
   Main Application Entry Point & Form Logic
   ========================================================================== */

(function() {
  'use strict';

  function initApp() {
    setupHeaderScroll();
    setupContactForm();
    setupSmoothScrollLinks();
  }

  /* --------------------------------------------------------------------------
     HEADER SCROLL STATE
     -------------------------------------------------------------------------- */
  function setupHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     CONTACT FORM HANDLING
     -------------------------------------------------------------------------- */
  function setupContactForm() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('submitBtn');

    if (!form || !submitBtn || !feedback) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // UI feedback state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>SENDING...</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<span>SENT ↗</span>';
        feedback.classList.remove('hidden');

        // Reset form after delay
        setTimeout(() => {
          form.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          feedback.classList.add('hidden');
        }, 4000);

      }, 1000);
    });
  }

  /* --------------------------------------------------------------------------
     SMOOTH SCROLL FOR NAV LINKS
     -------------------------------------------------------------------------- */
  function setupSmoothScrollLinks() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
