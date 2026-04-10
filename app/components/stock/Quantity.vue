<template>
  <div class="quantity">
    <button type="button" class="btn quantity_button minus" :disabled="localValue <= 1" @click="subtract">
      <Icon name="nsc:minus" :size="16" />
    </button>
    <span class="quantity_value">
      {{ localValue }}
    </span>
    <button type="button" class="btn quantity_button plus" :disabled="localValue >= max" @click="increment">
      <Icon name="nsc:plus-small" :size="16" />
    </button>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  max: {
    type: [Number, String],
    default: 1,
  },
});

const localValue = computed({
  get: () => { return props.modelValue; },
  set: (val) => { emit('update:modelValue', val); },
});
const increment = () => localValue.value += 1;
const subtract = () => {
  if (localValue.value > 1) localValue.value -= 1;
};
</script>

<style lang="scss" scoped>
.quantity{
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  &_value{
    width: 30px;
    padding: 0;
    text-align: center;
  }
  &_button{
    border: 1px solid $semi-grey;
    border-radius: 8px;
    width: 36px;
    height: 36px;
  }
}
</style>
