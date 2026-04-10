import { formatRelativeDate } from '@/utils/relativeDate';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      rd: (value: string | number | Date) => formatRelativeDate(value),
    },
  };
});
