<template>
  <div class="block">
    <div class="block_title">
      {{ title }}
    </div>
    <ul class="block_list">
      <li
        v-for="(li, idx) in bullets"
        :key="idx"
        :class="`block_item${index}-item`"
      >
        {{ li }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  bullets: {
    type: Array,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.block{
  border-bottom: .8px solid #E0DAD1;
  flex: 1;
  align-self: stretch;
  max-width: 700px;
  margin-bottom: 48px;
  &_title{
    font-family: $title-font;
    color: $brown;
    font-size: 24px;
    font-weight: 600;
  }
  &_list{
    margin: 20px 0 32px 0;
  }
}
</style>
