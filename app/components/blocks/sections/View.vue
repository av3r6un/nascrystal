<template>
  <div class="sections_list">
    <div v-for="(item, idx) in content" :key="idx" class="sections">
      <div class="sections_wrapper">
        <div class="sections_title">
          {{ item.title }}
        </div>
        <div class="sections_section">
          <ul v-for="(s, id) in item.items" :key="id" class="sections_section-item">
            <li class="sections_section-text">
              {{ s }}
            </li>
          </ul>
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
});

const content = computed(() => props.modelValue.content);
console.log(content.value);
const options = computed(() => props.modelValue.options);
</script>

<style lang="scss" scoped>
.sections{
  max-width: 700px;
  margin: 0 auto;
  &:last-child{
    .sections_wrapper{
      margin-bottom: 0;
    }
  }
  &_wrapper{
    border-bottom: 1px solid $semi-grey;
    margin-bottom: 32px;
    padding-bottom: 20px;
    flex: 1;
  }
  &_title{
    font-size: 24px;
    font-weight: bold;
    font-family: $title-font;
    color: $brown;
    margin-bottom: 20px;
  }
}
</style>
