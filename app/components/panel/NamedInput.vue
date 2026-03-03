<template>
  <div class="named_input">
    <div class="named_input-name">
      {{ name }}
    </div>
    <input
      v-model="localValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="defAutocomplete"
      class="input_wide"
    >
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
  type: {
    type: String,
    default: 'text',
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
    type: [String, Number, null] as PropType<string | number | null | undefined>,
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
.named_input{
  &-name{
    color: $brown;
    font-size: 16px;
    margin-bottom: 10px;
    font-weight: 600;
  }
}
</style>
