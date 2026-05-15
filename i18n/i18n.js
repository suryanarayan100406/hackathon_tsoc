// ============================================================
// VIDYASPARK — i18n (Multilingual) Engine
// ============================================================

const I18n = (() => {
  let translations = {};
  let currentLang = localStorage.getItem('vs_lang') || 'en';

  async function load() {
    try {
      const resp = await fetch('/i18n/translations.json');
      translations = await resp.json();
    } catch (e) {
      // Fallback: minimal inline translations
      translations = {
        en: { loading: 'Loading...', login: 'Login', student: 'Student', teacher: 'Teacher', admin: 'Admin' },
        hi: { loading: 'लोड हो रहा है...', login: 'लॉगिन', student: 'छात्र', teacher: 'शिक्षक', admin: 'एडमिन' }
      };
    }
    applyTranslations();
  }

  function t(key) {
    if (!translations[currentLang]) return key;
    return translations[currentLang][key] || translations['en'][key] || key;
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('vs_lang', lang);
    applyTranslations();
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    // Update active button in lang toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // Dispatch event so other modules can react
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function getLang() { return currentLang; }

  function applyTranslations() {
    // Apply to all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    // Apply to placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });
    // Apply to titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
  }

  function initLangToggle() {
    const toggles = document.querySelectorAll('.lang-toggle, .lang-switcher');
    toggles.forEach(toggle => {
      toggle.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
        btn.addEventListener('click', () => setLang(btn.dataset.lang));
      });
    });
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return t('good_morning');
    if (hour < 17) return t('good_afternoon');
    return t('good_evening');
  }

  return { load, t, setLang, getLang, applyTranslations, initLangToggle, getGreeting };
})();

// Auto-load on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { I18n.load(); });
} else {
  I18n.load();
}