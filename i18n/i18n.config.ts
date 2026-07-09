export default defineI18nConfig(() => {
  return {
    datetimeFormats: {
      en: {
        short: {
          year: 'numeric', month: 'short', day: 'numeric',
        },
        document: {
          year: 'numeric', month: 'long', day: 'numeric',
        },
        small: {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        },
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        },
      },
      ru: {
        short: {
          year: 'numeric', month: 'short', day: 'numeric',
        },
        small: {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        },
        document: {
          year: 'numeric', month: 'long', day: 'numeric',
        },
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        },
      },
    },
  };
});
