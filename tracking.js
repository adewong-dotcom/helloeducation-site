'use strict';

(() => {
  // Prevent duplicate listeners if this file is accidentally loaded twice.
  if (window.helloEducationTrackingLoaded) return;
  window.helloEducationTrackingLoaded = true;

  const MEASUREMENT_ID = 'G-BK0WB74GTM';

  // Reads the CURRENT language, including after a language-toggle click.
  function courseLanguage() {
    return document.documentElement.lang
      .toLowerCase()
      .startsWith('en') ? 'en' : 'es';
  }

  function track(eventName, parameters = {}) {
    if (typeof window.gtag !== 'function') return false;

    window.gtag('event', eventName, {
      ...parameters,
      course_language: courseLanguage(),
      send_to: MEASUREMENT_ID,

      // Helps deliver click events when the visitor leaves the page.
      transport_type: 'beacon'
    });

    return true;
  }

  function initializeTracking() {
    /*
     * 1. VIEW ITEM
     * Fires once per page load when at least half of the price
     * block is visible. Scrolling away and back does not repeat it.
     */
    const priceBlock = document.querySelector('#precios .price');

    if (priceBlock && 'IntersectionObserver' in window) {
      let recorded = false;

      const observer = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) =>
          entry.isIntersecting && entry.intersectionRatio >= 0.5
        );

        if (!visible || recorded) return;

        const priceElement = priceBlock.querySelector('[data-price]');
        const priceText = priceElement?.textContent || '';
        const price = Number(
          priceText.replace(/[^0-9.]/g, '')
        );

        const item = {
          item_id: 'renpy-course',
          item_name: 'Hello RenPy',
          quantity: 1
        };

        const parameters = {
          currency: 'USD',
          items: [item]
        };

        // Read the displayed price instead of hardcoding $49.
        if (priceText.trim() && Number.isFinite(price) && price > 0) {
          item.price = price;
          parameters.value = price;
        }

        if (track('view_item', parameters)) {
          recorded = true;
          observer.disconnect();
        }
      }, {
        threshold: 0.5
      });

      observer.observe(priceBlock);
    }

    /*
     * 2. FAQ OPEN
     * Capturing the toggle event also works when translated
     * content is replaced by your language-toggle script.
     */
    document.addEventListener('toggle', (event) => {
      const question = event.target;

      if (!(question instanceof HTMLDetailsElement)) return;
      if (!question.matches('#preguntas details[data-faq-id]')) return;
      if (!question.open) return;

      track('faq_open', {
        faq_id: question.dataset.faqId
      });
    }, true);

    /*
     * 3. CONTACT CLICKS
     * 4. REGISTRATION FORM CLICKS
     *
     * Uses event delegation so translated/replaced links
     * continue to work without attaching new listeners.
     */
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;

      const formButton = event.target.closest(
        '[data-track="registration-form"]'
      );

      if (formButton) {
        track('registration_form_click', {
          form_language:
            formButton.dataset.formLanguage || courseLanguage()
        });

        return;
      }

      const link = event.target.closest('a[href]');
      if (!link) return;

      let url;

      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (url.protocol === 'mailto:') {
        track('contact_click', {
          contact_method: 'email'
        });

        return;
      }

      const isWhatsApp =
        url.hostname === 'wa.me' ||
        url.hostname === 'whatsapp.com' ||
        url.hostname.endsWith('.whatsapp.com') ||
        url.protocol === 'whatsapp:';

      if (isWhatsApp) {
        track('contact_click', {
          contact_method: 'whatsapp'
        });
      }
    }, true);

    /*
     * 5. THANK-YOU PAGE VIEW
     * Only pages explicitly marked as thank-you pages fire this.
     * This is NOT a purchase-confirmation event.
     */
    if (document.body.dataset.pageType === 'thank-you') {
      track('thank_you_view');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initializeTracking,
      { once: true }
    );
  } else {
    initializeTracking();
  }
})();
