<template>
  <div class="entity">
    <div class="entity-name">
      {{ name }}
    </div>
    <div class="entity-wrapper">
      <input
        v-model="localValue.text"
        type="text"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="defAutocomplete"
        class="input_wide"
      >
      <input
        v-model="localValue.link"
        type="text"
        placeholder="https://example.com"
        :required="required"
        :autocomplete="defAutocomplete"
        class="input_wide"
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Введите текст',
  },
  required: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [Object, null] as PropType<string | number | null | undefined>,
    default: undefined,
  },
});

const defAutocomplete = computed(() => props.autocomplete ? 'on' : 'off');
const localValue = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
</script>

<style lang="scss" scoped>
.entity{
  container-type: inline-size;
  @container (max-width: 315px) {
    &-wrapper{
      flex-direction: column;
    }
  }
  &-name{
    color: $brown;
    font-size: 16px;
    margin-bottom: 10px;
    font-weight: 600;
  }
  &-wrapper{
    display: flex;
    align-items: center;
    gap: 10px;
    .input_wide{
      margin-bottom: 0;
    }
  }
}
</style>
