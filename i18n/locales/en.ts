export default defineI18nLocale(async () => {
  return await $fetch('/api/i18n/en');
});
