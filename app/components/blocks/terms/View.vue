<template>
  <ol class="terms_list">
    <li v-for="(item, idx) in content" :key="idx" class="terms">
      <span class="terms_title">
        {{ item.title }}
      </span>
      <p v-for="(p, id) in item.items" :key="id" class="terms_para">
        {{ p }}
      </p>
    </li>
  </ol>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const asText = (value: unknown) => typeof value === 'string' ? value : '';
const asItems = (value: unknown) => Array.isArray(value)
  ? value.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return asText((item as Record<string, unknown>).caption);
      return '';
    }).filter(Boolean)
  : [];

const content = computed(() => Array.isArray(props.modelValue.content)
  ? props.modelValue.content
      .filter(item => item && typeof item === 'object')
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          title: asText(row.title),
          items: asItems(row.items),
        };
      })
  : []);
const options = computed(() => props.modelValue.options);
</script>

<style lang="scss" scoped>
.terms{
  list-style: decimal;
  list-style-position: inside;
  font-size: 21px;
  color: $brown;
  margin: 10px 0;
  padding: 0;
  &_title{
    font-size: 24px;
    color: $brown;
  }
  &_para{
    font-size: 14px;
    white-space: pre-wrap;
    color: $light-brown;
    margin-bottom: 8px;
    &:last-child{
      margin-bottom: 0;
    }
    &:deep(a) {
      color: inherit;
    }
  }
}
</style>
