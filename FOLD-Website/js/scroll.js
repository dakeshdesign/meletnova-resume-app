/* ==========================================================================
   FOLD — CREATIVE STUDIO
   Scroll & Sticky Computer Zoom Engine
   ========================================================================== */

(function() {
  'use strict';

  // Elements
  let section, stickyViewport, computerWrapper, computerHeader;
  let chip1, chip2, chip3;

  // State variables for interpolation
  let scrollProgress = 0;
  let currentProgress = 0;
  let animationFrameId = null;

  function initScrollEngine() {
    section = document.getElementById('computer-experience');
    stickyViewport = document.getElementById('sticky-viewport');
    computerWrapper = document.getElementById('computer-wrapper');
    computerHeader = document.getElementById('computer-header');
    
    chip1 = document.getElementById('chip-1');
    chip2 = document.getElementById('chip-2');
    chip3 = document.getElementById('chip-3');

    if (!section || !computerWrapper) return;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    onScroll();
    renderLoop();
  }

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const windowHeight = window.innerHeight;

    // Total scrollable distance inside the sticky container
    const totalScrollable = sectionHeight - windowHeight;

    if (totalScrollable <= 0) return;

    // Calculate progress between 0.0 and 1.0
    // top goes from 0 down to -totalScrollable
    const scrolled = -rect.top;
    let rawProgress = scrolled / totalScrollable;
    scrollProgress = Math.min(Math.max(rawProgress, 0), 1);
  }

  // Linear interpolation function for smooth 60fps rendering
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function renderLoop() {
    // Smooth transition from current to target scrollProgress
    currentProgress = lerp(currentProgress, scrollProgress, 0.1);

    updateComputerZoom(currentProgress);

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  function updateComputerZoom(progress) {
    // Responsive scale range based on viewport width
    const isMobile = window.innerWidth <= 768;
    const initialScale = isMobile ? 0.65 : 0.75;
    const maxScale = isMobile ? 2.8 : 3.4;

    // Phase 1: Entry & Scale (Progress 0.0 - 0.75)
    // Phase 2: Enter Screen / Full Viewport (Progress 0.75 - 0.9)
    // Phase 3: Exit Fade Out (Progress 0.9 - 1.0)

    let targetScale = initialScale;
    let targetOpacity = 1;
    let headerOpacity = 1;

    if (progress <= 0.8) {
      // Scale up smoothly
      const scaleFactor = progress / 0.8;
      // Exponential curve for cinematic acceleration
      const easedFactor = Math.pow(scaleFactor, 1.8);
      targetScale = lerp(initialScale, maxScale, easedFactor);
      targetOpacity = 1;
      headerOpacity = 1 - (progress * 1.5);
    } else {
      // Near completion: Full screen overlay scale and fade out
      targetScale = maxScale + ((progress - 0.8) * 1.2);
      targetOpacity = 1 - ((progress - 0.85) / 0.15);
      headerOpacity = 0;
    }

    // Apply CSS transform to the computer wrapper
    computerWrapper.style.transform = `scale(${targetScale})`;
    computerWrapper.style.opacity = Math.max(Math.min(targetOpacity, 1), 0);

    if (computerHeader) {
      computerHeader.style.opacity = Math.max(Math.min(headerOpacity, 1), 0);
    }

    // Parallax movement for ambient chips
    if (chip1) chip1.style.transform = `translate(${progress * -60}px, ${progress * -40}px)`;
    if (chip2) chip2.style.transform = `translate(${progress * 80}px, ${progress * 50}px)`;
    if (chip3) chip3.style.transform = `translate(${progress * 40}px, ${progress * -80}px)`;
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollEngine);
  } else {
    initScrollEngine();
  }

})();
