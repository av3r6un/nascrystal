export function formatRelativeDate(value: number | string | Date, locale = 'ru-RU'): string {
  const now = Date.now();
  let dateValue = new Date(value);
  if (typeof value === 'number') {
    dateValue = new Date(value * 1000);
  }
  const time = dateValue.getTime();

  const diffMs = now - time;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) {
    return locale == 'ru-RU' ? `${diffHours} ч. назад` : `${diffHours} h ago`;
  }
  if (diffHours < 48) {
    return locale === 'ru-RU' ? 'Вчера' : 'Yesterday';
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(time);
}
