/* ==========================================================================
   FOLD — CREATIVE STUDIO
   Animations & Interactive Behavior Module
   ========================================================================== */

(function() {
  'use strict';

  function initAnimations() {
    setupAccordion();
    setupProjectRowInteractions();
    setupScrollRevealObserver();
  }

  /* --------------------------------------------------------------------------
     ACCORDION INTERACTION (SERVICES SECTION)
     -------------------------------------------------------------------------- */
  function setupAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close all items for single-accordion behavior (clean editorial feel)
        accordionItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.accordion-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        });

        // Toggle current item if it wasn't already open
        if (!isOpen) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Optionally open the first service by default
    if (accordionItems.length > 0) {
      accordionItems[0].classList.add('active');
      const firstTrigger = accordionItems[0].querySelector('.accordion-trigger');
      if (firstTrigger) firstTrigger.setAttribute('aria-expanded', 'true');
    }
  }

  /* --------------------------------------------------------------------------
     PROJECT ROW HOVER & INTERACTION
     -------------------------------------------------------------------------- */
  function setupProjectRowInteractions() {
    const projectRows = document.querySelectorAll('.project-row');

    projectRows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        // High-end tactile response
        row.style.zIndex = '5';
      });

      row.addEventListener('mouseleave', () => {
        row.style.zIndex = '1';
      });
    });
  }

  /* --------------------------------------------------------------------------
     SCROLL REVEAL OBSERVER
     -------------------------------------------------------------------------- */
  function setupScrollRevealObserver() {
    const revealElements = document.querySelectorAll(
      '.hero-title, .project-row, .accordion-item, .manifesto-card, .studio-quote, .contact-headline'
    );

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });

    // Add inline class handler for revealed elements
    const style = document.createElement('style');
    style.textContent = `
      .in-view {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

})();
