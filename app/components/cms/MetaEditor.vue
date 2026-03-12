<template>
  <div class="page_editor panel_section">
    <component
      :is="resolve(data.comp)"
      v-for="(data, name) in local"
      :key="name"
      :model-value="data.value"
      :name="`panel.${name}`"
      v-bind="data"
      @update:model-value="(value) => updateField(name, value)"
    />
  </div>
</template>

<script lang="ts" setup>
import Input from './elements/Input.vue';
import Checkbox from './elements/Checkbox.vue';
import Image from './elements/Image.vue';

const props = defineProps({
  modelValue: {
    type: Object,
  },
});
const emit = defineEmits(['update:modelValue']);

const componentMap = {
  Input,
  Checkbox,
  Image,
} as const;

function getComponent(componentName: string) {
  return componentMap[componentName as keyof typeof componentMap] ?? 'div';
}

const local = computed({
  get: () => props.modelValue ?? {},
  set: val => emit('update:modelValue', val),
});

const updateField = (name: string, value: unknown) => {
  const current = local.value as Record<string, unknown>;
  const currentField = current[name] as Record<string, unknown> | undefined;
  if (!currentField || typeof currentField !== 'object') return;

  local.value = {
    ...current,
    [name]: {
      ...currentField,
      value,
    },
  };
};

const resolve = (name: string) => {
  return getComponent(name);
};
</script>

<style lang="scss" scoped>
.page_editor{
  &-title{
    font-family: $title-font;
    font-size: 24px;
    font-weight: bold;
    color: $brown;
  }
  .input_wide{
    margin-bottom: 0;
  }
}
</style>
