<template>
  <div class="switch_view">
    <CmsReusable v-if="local.show" :reusable="local" />
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Object,
  },
});

const local = computed({
  get: () => props.modelValue ?? {},
  set: val => emit('update:modelValue', val),
});
console.log(local.value.show);
</script>

<style>

</style>
