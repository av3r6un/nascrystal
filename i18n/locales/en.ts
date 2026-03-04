export default defineI18nLocale(async () => {
  return await $fetch('/internal/i18n/en');
});
