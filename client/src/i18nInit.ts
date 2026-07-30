import i18n from './lib/i18n';

// Initialize i18n
i18n.init().catch(err => {
  console.error('Failed to initialize i18n:', err);
});

export default i18n;
