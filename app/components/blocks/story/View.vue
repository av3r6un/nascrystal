<template>
  <div class="story_block">
    <div class="story_block-image">
      <img
        v-if="image"
        :src="image"
        alt="story_image"
        class="base_image"
      >
      <div v-else class="story_block-image__cover">
        <Icon name="nsc:diamond" :size="64" />
      </div>
    </div>
    <div class="story_block-content">
      <p
        v-for="(p, idx) in content"
        :key="idx"
        class="story_block-content__p"
      >
        {{ p }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const content = computed(() => props.modelValue.content);
const image = computed(() => props.modelValue.image);
</script>

<style lang="scss" scoped>
.story_block{
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 48px;
  @media screen {
    @media (max-width: 846px) {
      flex-direction: column;
      align-items: center;
    }
  }
  &-image{
    flex: 1;
    width: 47%;
    max-width: 392px;
    border-radius: 8px;
    background: $light-pink;
    @media (max-width: 846px) {
      min-height: 294px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 392px;
    }
    @media (max-width: 430px) {
      width: 90%;
      min-width: auto;
    }
    &__cover{
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      border-radius: inherit;
    }
  }
  &-content{
    max-width: 400px;
    flex: 1;
    width: 47%;
    @media (max-width: 846px) {
      min-width: 392px;
    }
    @media (max-width: 430px) {
      width: 90%;
      min-width: auto;
    }
    &__p{
      margin-bottom: 16px;
      color: $light-grey;
    }
  }
}
</style>
