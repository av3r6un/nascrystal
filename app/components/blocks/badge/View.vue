<template>
  <div class="badge">
    <div class="badge_wrapper wp-px0">
      <div class="badge_image">
        <img
          v-if="content.image"
          :src="content.image"
          alt="image"
          class="base_image"
        >
        <div class="badge_image-blank">
          <Icon name="nsc:diamond" :size="64" />
        </div>
      </div>
      <div class="badge_info">
        <div class="badge_title">
          {{ content.title }}
        </div>
        <div class="badge_story">
          {{ content.description }}
        </div>
        <NuxtLink class="badge_cta base_link" :to="validatedLink">
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

const content = computed(() => props.modelValue ?? {});
const validatedLink = computed(() => {
  const to = content.value?.button_to;
  if (!to) return '/';
  const resolved = router.resolve(to);
  return resolved.matched.length > 0 ? resolved.fullPath : '/';
});
</script>

<style lang="scss" scoped>
.badge{
  background: $pinky;
  &_wrapper{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 48px;
    @media (max-width: 1130px) {
      flex-direction: column;
      padding-top: 64px;
      padding-bottom: 64px;
    }
  }
  &_info{
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
    max-width: 550px;
  }
  &_title{
    font-family: $title-font;
    font-size: 30px;
    font-weight: 600;
    color: $brown;
  }
  &_story{
    color: $light-brown;
    font-size: 16px;
  }
  &_cta{
    color: #B49764;
    text-decoration: underline;
    font-size: 14px;
  }
  &_image{
    width: 584px;
    height: 438px;
    position: relative;
    border-radius: 8px;
    background: $semi-grey;
    &-blank{
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      border-radius: inherit;
    }
    @media (max-width: 620px) {
      width: 95%;
      height: auto;
      aspect-ratio: 4 / 3;
    }
  }
}
</style>
