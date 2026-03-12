<template>
  <div class="selection" :class="{ opened: opened, selected: modelValue }" @click="toggle">
    <div v-show="opened" class="selection_options">
      <div class="selection_options-scroll">
        <div v-for="(o, idx) in options" :key="idx" class="selection_options-option">
          <div class="option" @click="select(o)">
            {{ t(`${o.name}`) }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="localValue" class="selection_default selected">
      {{ t(`${localText}`) }}
    </div>
    <div v-else class="selection_default">
      {{ te(`${placeholder}`) ? t(`${placeholder}`) : placeholder }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t, te } = useI18n();
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: [String, null],
    required: true,
  },
  options: {
    type: Array<object>,
  },
  placeholder: {
    type: String,
    default: 'panel.selection_placeholder',
  },
});

const localValue = computed({
  get: () => props.modelValue ?? '',
  set: val => emit('update:modelValue', val),
});

const opened = ref(false);
const localText = ref('');

const select = (option: object) => {
  localValue.value = option.id;
  localText.value = option.name;
};
const toggle = () => opened.value = !opened.value;
const refresh = () => emit('update:modelValue', null);
</script>

<style lang="scss" scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
.selection{
  user-select: none;
  height: 50px;
  border-radius: 8px;
  border: 1px solid $semi-grey;
  min-width: 120px;
  padding: 5px 12px;
  position: relative;
  background: $white;
  width: 100%;
  &.opened{
    z-index: 3;
    .block_selector-default:after{
      transform: rotateX(180deg);
    }
  }
  &_options{
    position: absolute;
    width: 100%;
    top: 100%;
    left: 0;
    padding: 5px;
    margin-top: 5px;
    box-sizing: border-box;
    border: 1px solid $semi-grey;
    background: $white;
    &-scroll{
      padding: 0 2px;
      max-height: 200px;
      overflow-y: auto;
      &::-webkit-scrollbar{
        width: 4px;
        background: $pinky;
        border-radius: 2px;
        &-thumb{
          background: $light-brown;
          border-radius: inherit;
        }
      }
    }
    .option{
      box-sizing: border-box;
      border-radius: 3px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: transparent;
      transition: all .3s ease;
      color: $light-brown;
      &:hover{
        background: $semi-grey;
        color: $brown;
      }
    }
  }
  &_default{
    color: $light-brown;
    z-index: 1;
    display: flex;
    align-items: center;
    font-size: 16px;
    height: 100%;
    width: 100%;
    position: relative;
    &:after{
      position: absolute;
      content: '\f078';
      font-family: 'FontAwesome';
      width: 16px;
      height: 16px;
      top: calc(50% - 9px);
      right: 0;
      color: $brown;
      font-size: 16px;
      transition: all .4s ease;
      z-index: 1;
    }
  }
}
</style>
