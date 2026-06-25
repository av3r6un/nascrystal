<template>
  <div class="form_check">
    <input
      :id="inputId"
      :checked="modelValue"
      type="checkbox"
      :required="required"
      @change="emits('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <label :for="inputId" class="form_check-label" :class="{ required }">
      <slot>
        {{ label }}
      </slot>
    </label>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
  },
  required: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:modelValue']);
const inputId = computed(() => props.id || useId());
</script>

<style lang="scss" scoped>
.form_check{
  color: $brown;
  &-label{
    &.required{
      position: relative;
      &:before{
        position: relative;
        content: '*';
        left: -1px;
        color: red;
        font-size: 11px;
        top: -5px;
      }
    }
  }
}
</style>
