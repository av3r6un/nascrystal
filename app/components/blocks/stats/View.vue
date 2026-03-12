<template>
  <div class="stat_list">
    <div v-for="(item, idx) in content" :key="idx" class="stat">
      <div class="stat_wrapper">
        <div class="stat_title">
          {{ item.title }}
        </div>
        <div class="stat_caption">
          {{ item.caption }}
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
  options: {
    type: Object,
    default: () => ({}),
  },
});
const content = computed(() => props.modelValue.content);
</script>

<style lang="scss" scoped>
.stat{
  &_list{
    display: flex;
    justify-content: center;
    gap: 32px;
    @media (max-width: 846px) {
      flex-wrap: wrap;
    }
  }
  &_wrapper{
    padding: 32px;
    background: $light-pink;
    border-radius: 8px;
    min-width: 256px;
  }
  &_title{
    color: $yellow-brown;
    font-family: $title-font;
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }
  &_caption{
    color: $light-brown;
    font-size: 14px;
    text-align: center;
  }
}
</style>
