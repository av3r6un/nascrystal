<template>
  <div class="filter_options" :class="{ collapsed: !initialState }" :style="{ maxHeight: totalHeight }">
    <div
      v-for="(option, idx) in options"
      :key="idx"
      class="filter_option"
      :class="{ single, selected: isSelected(option) }"
    >
      <div v-for="(v, k) in option" :key="k" class="filter_option-name" @click="select(k)">
        {{ v ?? k }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  options: {
    type: Array<object>,
  },
  single: {
    type: Boolean,
    default: false,
  },
  initialState: {
    type: Boolean,
    default: false,
  },
  framed: {
    type: Boolean,
    default: false,
  },
});

const localValue = computed({
  get: () => { return props.modelValue; },
  set: (val) => { emit('update:modelValue', val); },
});

const select = (val: number | string) => {
  if (props.single) {
    localValue.value = [val];
    return;
  }

  const hasValue = localValue.value.includes(val);

  localValue.value = hasValue
    ? localValue.value.filter(item => item !== val)
    : [...localValue.value, val];
};

const isSelected = computed(() => (option: Record<string, string>) => {
  const key = Object.keys(option)[0];

  return localValue.value.includes(key);
});
const totalHeight = computed(() => {
  const totalItems = props.options?.length;
  if (!totalItems || props.framed) return '66px';
  return `${(totalItems / 3) * 39}px`;
});
</script>

<style lang="scss" scoped>
.filter{
  &_options{
    max-width: 210px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    user-select: none;
    height: auto;
    overflow: hidden;
    transition: all .4s ease;
    &.collapsed{
      max-height: 66px !important;
    }
  }
  &_option{
    border-radius: 20px;
    border: 1px solid $semi-grey;
    cursor: pointer;
    font-size: 12px;
    color: $brown;
    &.single{
      border: none;
      color: $light-brown;
      font-size: 14px;
      font-weight: 300;
      &.selected{
        background: transparent;
        font-weight: 500;
        color: $brown;
      }
      .filter_option-name{
        padding: 0;
      }
    }
    &.selected{
      background: $light-brown;
      border-color: $light-brown;
      color: $white;
    }
    &-name{
      color: inherit;
      padding: 6px 12px;
      font-size: inherit;
    }
  }
}
</style>
