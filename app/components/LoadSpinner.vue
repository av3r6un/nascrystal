<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 28"
    class="load-spinner"
    role="status"
    :aria-label="t('default.loading')"
    fill="none"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <defs>
      <linearGradient
        :id="gradientId"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop class="load-spinner__start" offset="0%" />
        <stop class="load-spinner__end" offset="100%" />
      </linearGradient>
    </defs>
    <path
      class="load-spinner__track"
      d="M7 3.5H21L25.6667 10.5L14 25.6667L2.33337 10.5L7 3.5Z M12.8334 3.5L9.33337 10.5L14 25.6667L18.6667 10.5L15.1667 3.5 M2.33337 10.5H25.6667"
    />
    <path
      class="load-spinner__worm"
      :stroke="`url(#${gradientId})`"
      pathLength="100"
      stroke-dasharray="12 88"
      d="M7 3.5H21L25.6667 10.5L14 25.6667L2.33337 10.5L7 3.5H12.8334L9.33337 10.5L14 25.6667L18.6667 10.5L15.1667 3.5H21L25.6667 10.5H2.33337L7 3.5"
    />
  </svg>
</template>

<script setup lang="ts">
const { t } = useI18n();
const gradientId = `load-spinner-${useId()}`;
</script>

<style scoped lang="scss">
.load-spinner {
  display: inline-block;
  width: 5em;
  height: 5em;
  flex-shrink: 0;
  overflow: visible;
  animation: spinner-bump 4s linear infinite;

  &__track {
    stroke: $pinky;
  }

  &__start {
    stop-color: $yellow-brown;
  }

  &__end {
    stop-color: $brown;
  }

  &__worm {
    animation: spinner-worm 4s cubic-bezier(0.42, 0.17, 0.75, 0.83) infinite;
  }
}

@keyframes spinner-bump {
  from, 42%, 46%, 51%, 55%, 59%, 63%, 67%, 71%, 74%, 78%, 81%, 85%, 88%, 92%, to {
    transform: translate(0, 0);
  }
  44% { transform: translate(1.33%, 6.75%); }
  53% { transform: translate(-16.67%, -0.54%); }
  61% { transform: translate(3.66%, -2.46%); }
  69% { transform: translate(-0.59%, 15.27%); }
  76% { transform: translate(-1.92%, -4.68%); }
  83% { transform: translate(9.38%, 0.96%); }
  90% { transform: translate(-4.55%, 1.98%); }
}

@keyframes spinner-worm {
  from { stroke-dashoffset: 0; }
  25% { stroke-dashoffset: -25; }
  to { stroke-dashoffset: -100; }
}

@media (prefers-reduced-motion: reduce) {
  .load-spinner,
  .load-spinner__worm {
    animation: none;
  }
}
</style>
