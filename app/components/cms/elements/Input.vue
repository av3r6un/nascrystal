<template>
  <div class="input">
    <div class="input_name" :class="{ required }">
      {{ t(`${name}`) }}
    </div>
    <input
      v-model="localValue"
      :type="type"
      :placeholder="ph"
      :required="required"
      :autocomplete="defAutocomplete"
      class="input_wide"
    >
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';

const emit = defineEmits(['update:modelValue']);
const { t, te } = useI18n();

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
const ph = computed(() => {
  return te(props.placeholder) ? t(props.placeholder) : props.placeholder;
});
</script>

<style lang="scss" scoped>
.input{
  &_name{
    color: $brown;
    font-size: 16px;
    margin-bottom: 10px;
    font-weight: 600;
    &.required{
      position: relative;
      &:after{
        position: relative;
        content: '*';
        right: -2px;
        color: red;
        font-size: 11px;
        top: -5px;
      }
    }
  }
}
</style>
