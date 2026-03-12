<template>
  <div class="input_list">
    <div class="input_list-header">
      <div class="input_list-name">
        {{ name }}
      </div>
      <div class="input_list-add" @click="addEmpty">
        <Icon name="nsc:plus-sign" :size="18" />
      </div>
    </div>
    <div v-for="(i, idx) in localValue" :key="idx" class="input_list-wrapper">
      <input
        v-model="localValue[idx]"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="defAutocomplete"
        class="input_wide"
      >
      <Icon v-if="idx >= 1" name="nsc:trash" :size="18" @click="removeInput(idx)" />
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
    type: [Object, null] as PropType<object | null | undefined>,
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

const removeInput = (idx: number) => localValue.value.splice(idx, 1);
const addEmpty = () => localValue.value.push('');
</script>

<style lang="scss" scoped>
.input_list{
  &-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  &-name{
    color: $brown;
    font-size: 16px;
    font-weight: 600;
  }
  &-add{
    border-radius: 6px;
    background: $brown;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    cursor: pointer;
    .m-icon{
      path {
        stroke: $white;
      }
    }
  }
  &-wrapper{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 5px;
    &:last-child{
      margin-bottom: 0;
    }
    .m-icon{
      cursor: pointer;
    }
    .input_wide{
      margin-bottom: 0;
    }
  }
}
</style>
