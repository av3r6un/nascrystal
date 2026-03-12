<template>
  <div class="wp-px0">
    <div class="feature_list">
      <div v-for="(item, idx) in content" :key="idx" class="feature">
        <div class="feature_wrapper" :class="{ bg: !reversed }">
          <div class="feature_icon" :class="{ bg: reversed }">
            <Icon :name="`nsc:${item.icon}`" :size="24" />
          </div>
          <div class="feature_title">
            {{ item.title }}
          </div>
          <div class="feature_info">
            {{ item.info }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  reversed: {
    type: Boolean,
    default: false,
  },
});

const content = computed(() => props.modelValue.content);
</script>

<style lang="scss" scoped>
.feature{
  &_list{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    align-items: stretch;
    justify-items: center;
    gap: 24px;
    @media (max-width: 1240px) {
      padding-right: 12px;
      padding-left: 12px;
    }
    @media (max-width: 1180px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
  &_wrapper{
    width: 286px;
    height: 200px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 36px;
    box-sizing: border-box;
    background: $white;
    &.bg {
      background: $light-pink;
    }
  }
  &_icon{
    margin-bottom: 16px;
    &.bg{
      margin-bottom: 20px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $pinky;
    }
  }
  &_title{
    color: $brown;
    font-family: $title-font;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  &_info{
    color: $light-brown;
    font-size: 14px;
    text-align: center;
  }
}
</style>
