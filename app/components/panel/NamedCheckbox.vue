<template>
  <div class="named_checkbox">
    <div class="named_checkbox-info">
      <div class="named_checkbox-title">
        {{ title }}
      </div>
      <div class="named_checkbox-description">
        {{ description }}
      </div>
    </div>
    <div class="named_checkbox-checkbox" :class="{ checked: isChecked }" @click="toggle">
      <input type="checkbox" class="inv_input named_checkbox-check" :checked="isChecked">
      <div class="named_checkbox-check" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';

type CheckboxState = string | boolean | number | null;

const emit = defineEmits<{
  (e: 'update:modelValue', value: CheckboxState): void;
}>();

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'Включить опцию',
  },
  states: {
    type: Array as PropType<[CheckboxState, CheckboxState]>,
    required: false,
  },
  modelValue: {
    type: [String, Boolean, Number, null] as PropType<CheckboxState>,
    required: true,
  },
});

const stateOn = computed(() => props.states?.[0] ?? true);
const stateOff = computed(() => props.states?.[1] ?? false);
const isChecked = computed(() => props.modelValue === stateOn.value);

const toggle = () => {
  emit('update:modelValue', isChecked.value ? stateOff.value : stateOn.value);
};
</script>

<style lang="scss" scoped>
.named_checkbox{
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 5px;
  &-title{
    font-size: 22px;
    font-family: $title-font;
    color: $brown;
    font-weight: bold;
    margin-bottom: 4px;
  }
  &-info{
    @media screen {
      @media (max-width: 408px) {
        max-width: calc(100% - 50px);
      }
    }
  }
  &-description{
    color: $light-brown;
  }
  &-checkbox{
    cursor: pointer;
    height: 24px;
    width: 44px;
    border-radius: 50px;
    position: relative;
    transition: all .4s ease;
    border: 1px solid $brown;
    background: $pinky;
    &.checked{
      background: $brown;
      .named_checkbox-check{
        left: calc(100% - 21px);
        background: $white;
      }
    }
  }
  &-check{
    position: absolute;
    left: 1px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    top: calc(50% - 10px);
    background: $light-brown;
    transition: all .4s ease;
  }
}
</style>
