<template>
  <div class="block_hero" :class="{ isFullWidth }">
    <img
      v-if="image"
      :src="image"
      alt="block_hero-image"
      class="base_image block_hero-image"
    >
    <div class="block_hero-wrapper wp-px0">
      <div class="block_hero-content">
        <div class="block_hero-title">
          {{ content.title }}
        </div>
        <div class="block_hero-subtitle">
          {{ content.subtitle }}
        </div>
        <NuxtLink :to="validatedLink" class="base_link block_hero-cta">
          {{ content.button_text }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const content = computed(() => props.modelValue?.content ?? {});
const image = computed(() => content.value?.image ?? props.modelValue?.image ?? null);
const validatedLink = computed(() => {
  const to = content.value?.button_to;
  if (!to) return '/';
  const resolved = router.resolve(to);
  return resolved.matched.length > 0 ? resolved.fullPath : '/';
});
const isFullWidth = computed(() => !!props.modelValue?.options?.full_width);
</script>

<style lang="scss" scoped>
.block_hero{
  height: 700px;
  position: relative;
  user-select: none;
  &-image{
    position: absolute;
  }
  &:before{
    position: absolute;
    content: '';
    height: 100%;
    width: 100%;
    background: $blur;
    z-index: 1;
    backdrop-filter: blur(3px);
  }
  &-wrapper{
    height: 100%;
    @media screen {
      @media (max-width: 500px) {
        align-items: center;
      }
    }
  }
  &-content{
    height: 100%;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 23px;
  }
  &-title{
    font-family: $title-font;
    color: $brown;
    font-size: 60px;
    max-width: 600px;
    @media (max-width: 575px) {
      font-size: 40px;
    }
    @media (max-width: 500px) {
      text-align: center;
    }
  }
  &-subtitle{
    font-size: 18px;
    color: $light-brown;
    text-shadow: 1px 1px 10px rgba(#000, .3);
    @media (max-width: 500px) {
      text-align: center;
    }
  }
  &-cta{
    padding: 14px 32px;
    border-radius: 8px;
    background: $brown;
    color: $white;
    font-weight: 100;
    box-sizing: border-box;
    text-transform: uppercase;
  }
}
</style>
