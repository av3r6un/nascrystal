<template>
  <div
    ref="scrollCont"
    class="filter_options"
    :class="[{ opened: isOpened, scrollable: isScrollable }, partialName]"
    @transitionend="onTransitionEnd"
  >
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
  name: {
    type: String,
    default: '',
  },
});

const localValue = computed({
  get: () => { return props.modelValue; },
  set: (val) => { emit('update:modelValue', val); },
});

const scrollCont = ref(null);
const isScrollable = ref(false);

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

const isOpened = computed(() => props.initialState);

const partialName = computed(() => {
  const name = props.name?.split('.');
  if (!name.length) return '';
  return name[name.length - 1];
});

const updateScrollableState = () => {
  if (!scrollCont.value) return;
  isScrollable.value = props.initialState && scrollCont.value.scrollHeight > 309;
};

const onTransitionEnd = (event: object) => {
  if (event.propertyName !== 'max-height') return;
  updateScrollableState();
};

watch(isOpened, () => {
  isScrollable.value = false;
});

function scrollToTop() {
  scrollCont.value?.scrollTo({ top: 0, behavior: 'smooth' });
};

defineExpose({
  scrollToTop,
});
</script>

<style lang="scss" scoped>
.filter{
  &_options{
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    user-select: none;
    height: auto;
    width: 100%;
    transition: max-height .5s ease;
    overflow-y: hidden;
    max-height: 66px;
    &::-webkit-scrollbar{
      -webkit-appearance: none;
    }
    &.opened{
      max-height: 310px;
    }
    &.scrollable {
      overflow-y: auto;
      &::-webkit-scrollbar{
        -webkit-appearance: none;
        width: 4px;
        border-radius: 8px;
        background: $pinky;
        &-thumb{
          background: $light-brown;
          border-radius: 8px;
        }
      }
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
