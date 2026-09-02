<template>
  <div class="catalog_filter">
    <div class="catalog_filter-title" @click="toggle">
      <span class="title">{{ t(name) }}</span>
      <Icon v-if="!framed" :name="`nsc:toggle-${opened ? 'up' : 'down'}`" />
    </div>
    <FilterOption
      ref="filterOptions"
      :model-value="modelValue"
      :options="options"
      :single="single"
      :initial-state="opened"
      :framed="framed"
      :name="name"
      @update:model-value="emit('update:modelValue', $event as string[])"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string[];
  name: string;
  options?: Record<string, string>[];
  single?: boolean;
  initialState?: boolean;
  framed?: boolean;
}>(), {
  options: () => [],
  single: false,
  initialState: false,
  framed: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const { t } = useI18n();
const opened = ref(props.initialState);
const filterOptions = ref<{ scrollToTop: () => void } | null>(null);

const toggle = () => {
  opened.value = !opened.value;
  if (!opened.value) filterOptions.value?.scrollToTop();
};
</script>

<style lang="scss" scoped>
.catalog_filter{
  max-width: 230px;
  &-title{
    color: $light-brown;
    font-weight: 300;
    user-select: none;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
}
</style>
