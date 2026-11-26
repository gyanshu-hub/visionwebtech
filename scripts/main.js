/**
 * VISION WEB TECH — Core Application Scripts
 * High-performance, clean vanilla JS with zero external dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  initLogoRevealIntro();
  initHeader();
  initMobileMenu();
  initVideoPlayer();
  initFaqAccordion();
  initForms();
  initCurrentYear();
  initPortfolioAccessibility();
  initQueryParams();
});

/* Automatically pre-select service or plan in Book a Call form from URL query parameters */
function initQueryParams() {
  const serviceSelect = document.getElementById('formService');
  if (!serviceSelect) return;

  const params = new URLSearchParams(window.location.search);
  const planParam = params.get('plan');
  const serviceParam = params.get('service');

  if (planParam) {
    if (planParam === 'starter') serviceSelect.value = 'Website Development';
    if (planParam === 'business') serviceSelect.value = 'Full Digital Overhaul';
    if (planParam === 'custom') serviceSelect.value = 'Custom Web Applications';
  }

  if (serviceParam) {
    const map = {
      'website-dev': 'Website Development',
      'ecommerce-dev': 'E-commerce Development',
      'landing-page': 'Landing Page Development',
      'web-apps': 'Custom Web Applications',
      'ui-ux': 'UI/UX Design',
      'ai-automation': 'AI Automation'
    };
    if (map[serviceParam]) {
      serviceSelect.value = map[serviceParam];
    }
  }
}

/* 1-1.5s Elegant Logo Reveal Intro Controller */
function initLogoRevealIntro() {
  const intro = document.getElementById('siteIntro');
  if (!intro) return;

  // Check if session already played the intro to keep navigation swift
  const hasIntroPlayed = sessionStorage.getItem('vwt_intro_shown');
  const duration = hasIntroPlayed ? 600 : 1350; // 1.35 seconds for full cinematic reveal

  setTimeout(() => {
    intro.classList.add('intro-hidden');
    sessionStorage.setItem('vwt_intro_shown', 'true');
    setTimeout(() => {
      intro.remove(); // Remove from DOM after fade out to reclaim memory
    }, 600);
  }, duration);
}

/* Sticky Header & Scroll Effect */
function initHeader() {
  const header = document.querySelector('.header-wrapper');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Mobile Navigation Toggle */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when clicking outside or on link
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  });
}

/* Hero Video Autoplay & Continuous Loop Assurance (Controls completely removed) */
function initVideoPlayer() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  // Strict uninterrupted ambient playback configuration
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Browser autoplay policy retry
      video.muted = true;
      video.play().catch(e => console.log('Autoplay retry:', e));
    });
  }

  // Ensure playback resumes immediately if pause is ever triggered
  video.addEventListener('pause', () => {
    video.play().catch(() => {});
  });
}

/* FAQ Accordion */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items for clean accordion UX
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      if (!isActive) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
}

/* Input Sanitization helper to neutralize malicious HTML/JS injection */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"&]/g, (char) => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      case '&': return '&amp;';
      default: return char;
    }
  }).trim();
}

/* Strict 10-Digit Numeric Phone Validation Handler */
function setupPhoneValidation(inputEl, errorEl) {
  if (!inputEl) return;

  // Real-time keystroke filter: permit ONLY numeric characters (0-9) and cap at 10 digits
  inputEl.addEventListener('input', () => {
    const rawVal = inputEl.value;
    const cleanDigits = rawVal.replace(/\D/g, '').slice(0, 10);
    inputEl.value = cleanDigits;

    if (cleanDigits.length === 10) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      if (errorEl) errorEl.classList.remove('visible');
    } else {
      inputEl.classList.remove('is-valid');
      if (cleanDigits.length > 0 && cleanDigits.length < 10) {
        inputEl.classList.add('is-invalid');
        if (errorEl) {
          errorEl.textContent = `Phone number must be exactly 10 digits (${cleanDigits.length}/10 entered).`;
          errorEl.classList.add('visible');
        }
      } else {
        inputEl.classList.remove('is-invalid');
        if (errorEl) errorEl.classList.remove('visible');
      }
    }
  });

  inputEl.addEventListener('blur', () => {
    const digits = inputEl.value.replace(/\D/g, '');
    if (digits.length !== 10) {
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');
      if (errorEl) {
        errorEl.textContent = 'Please enter a valid 10-digit phone number.';
        errorEl.classList.add('visible');
      }
    } else {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      if (errorEl) errorEl.classList.remove('visible');
    }
  });
}

/* WhatsApp & Email Integration for Forms with Strict Security Validation */
function initForms() {
  // 1. Consultation Booking Form
  const bookingForm = document.getElementById('consultationForm');
  const bookPhoneInput = document.getElementById('formPhone');
  const bookPhoneError = document.getElementById('phoneError');
  if (bookPhoneInput) {
    setupPhoneValidation(bookPhoneInput, bookPhoneError);
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const phoneRaw = bookPhoneInput ? bookPhoneInput.value.replace(/\D/g, '') : '';
      if (phoneRaw.length !== 10) {
        if (bookPhoneInput) {
          bookPhoneInput.focus();
          bookPhoneInput.classList.add('is-invalid');
        }
        if (bookPhoneError) {
          bookPhoneError.textContent = 'Please enter exactly 10 numeric digits before submitting.';
          bookPhoneError.classList.add('visible');
        }
        return false;
      }

      const name = sanitizeInput(document.getElementById('formName')?.value || '');
      const email = sanitizeInput(document.getElementById('formEmail')?.value || '');
      const business = sanitizeInput(document.getElementById('formBusiness')?.value || 'N/A');
      const service = sanitizeInput(document.getElementById('formService')?.value || 'Website Development');
      const budget = sanitizeInput(document.getElementById('formBudget')?.value || 'Flexible');
      const details = sanitizeInput(document.getElementById('formDetails')?.value || '');
      const contactMethod = sanitizeInput(document.getElementById('formContactMethod')?.value || 'WhatsApp');

      const whatsappText = `*New Project Consultation Request - VISION WEB TECH*%0A%0A` +
        `*Name:* ${encodeURIComponent(name)}%0A` +
        `*Email:* ${encodeURIComponent(email)}%0A` +
        `*Phone (10 Digits):* ${encodeURIComponent(phoneRaw)}%0A` +
        `*Business:* ${encodeURIComponent(business)}%0A` +
        `*Service:* ${encodeURIComponent(service)}%0A` +
        `*Estimated Budget:* ${encodeURIComponent(budget)}%0A` +
        `*Preferred Contact:* ${encodeURIComponent(contactMethod)}%0A%0A` +
        `*Project Details:*%0A${encodeURIComponent(details)}`;

      const whatsappUrl = `https://wa.me/919546723997?text=${whatsappText}`;
      
      // Open WhatsApp chat securely
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Connecting to WhatsApp...';
        setTimeout(() => {
          submitBtn.innerHTML = 'Consultation Request Sent!';
          bookingForm.reset();
          if (bookPhoneInput) bookPhoneInput.classList.remove('is-valid', 'is-invalid');
          setTimeout(() => { submitBtn.innerHTML = originalText; }, 3000);
        }, 1000);
      }
    });
  }

  // 2. Direct Contact Inquiry Form
  const contactForm = document.getElementById('inquiryForm');
  const contactPhoneInput = document.getElementById('contactPhone');
  const contactPhoneError = document.getElementById('contactPhoneError');
  if (contactPhoneInput) {
    setupPhoneValidation(contactPhoneInput, contactPhoneError);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const phoneRaw = contactPhoneInput ? contactPhoneInput.value.replace(/\D/g, '') : '';
      if (phoneRaw.length !== 10) {
        if (contactPhoneInput) {
          contactPhoneInput.focus();
          contactPhoneInput.classList.add('is-invalid');
        }
        if (contactPhoneError) {
          contactPhoneError.textContent = 'Please enter exactly 10 numeric digits before submitting.';
          contactPhoneError.classList.add('visible');
        }
        return false;
      }

      const name = sanitizeInput(document.getElementById('contactName')?.value || '');
      const email = sanitizeInput(document.getElementById('contactEmail')?.value || '');
      const message = sanitizeInput(document.getElementById('contactMessage')?.value || '');

      const whatsappText = `*New Contact Inquiry - VISION WEB TECH*%0A%0A` +
        `*Name:* ${encodeURIComponent(name)}%0A` +
        `*Email:* ${encodeURIComponent(email)}%0A` +
        `*Phone (10 Digits):* ${encodeURIComponent(phoneRaw)}%0A%0A` +
        `*Message:*%0A${encodeURIComponent(message)}`;

      const whatsappUrl = `https://wa.me/919546723997?text=${whatsappText}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = 'Inquiry Sent!';
        contactForm.reset();
        if (contactPhoneInput) contactPhoneInput.classList.remove('is-valid', 'is-invalid');
        setTimeout(() => { submitBtn.innerHTML = 'SEND MESSAGE VIA WHATSAPP'; }, 3000);
      }
    });
  }
}

/* Dynamic Copyright Year */
function initCurrentYear() {
  const yearSpans = document.querySelectorAll('.current-year');
  const year = new Date().getFullYear();
  yearSpans.forEach(el => el.textContent = year);
}

/* Keyboard Accessibility & Enter key activation for portfolio project cards */
function initPortfolioAccessibility() {
  const cards = document.querySelectorAll('.portfolio-card');
  cards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

