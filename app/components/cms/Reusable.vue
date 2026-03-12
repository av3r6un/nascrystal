<template>
  <component
    :is="resolvedComponent"
    :model-value="state"
  />
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  reusable: {
    type: Object,
    default: () => ({}),
  },
});

const reusableName = computed({
  get: () => props.reusable.block ?? '',
  set: val => emit('update:modelValue', { ...props.reusable, block: val }),
});
const state = computed({
  get: () => props.reusable.show ?? false,
  set: val => emit('update:modelValue', { ...props.reusable, show: val }),
});

const reusableRegistry = useReusable();
const reusableComponents = useReusableComponents();

const resolvedComponent = computed(() => {
  const schema = reusableRegistry[reusableName.value];

  if (!schema) return null;
  const folder = `${schema.name}`.split('/')[0];
  return reusableComponents[`${folder}/View`] ?? null;
});
</script>

<style>

</style>
