<template>
  <div class="plate">
    <div class="plate_wrapper">
      <div class="plate_icon">
        <Icon :name="`nsc:${icon}`" :size="24" />
      </div>
      <div class="plate_info">
        <div class="plate_title">
          {{ title }}
        </div>
        <div class="plate_text">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String,
    default: 'diamond',
  },
  title: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.plate{
  &_wrapper{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    border-radius: 8px;
    background: $light-pink;
    width: 100%;
    padding: 20px;
  }
  &_info{
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  &_title{
    text-transform: uppercase;
    color: $light-brown;
    font-size: 12px;
  }
  &_icon{
    display: flex;
  }
  &_text{
    font-size: 14px;
    color: $brown;
    display: flex;
    gap: 10px;
    @media screen {
      @media (max-width: 415px) {
        flex-direction: column;
        gap: 5px;
      }
    }
  }
}
</style>
