import 'vue';

declare module 'vue' {
  interface ComponentCustomProperties {
    $rd: (value: number | string | Date) => string;
  };
};
