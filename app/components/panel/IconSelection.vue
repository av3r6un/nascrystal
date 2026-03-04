<template>
  <div class="selection" :class="{ opened, selected: modelValue }" @click="toggle">
    <div v-show="opened" class="selection_options">
      <div class="selection_options-scroll">
        <div v-for="(i, idx) in allIcons" :key="idx" class="selection_option">
          <div class="option" @click="select(i)">
            <Icon :name="`nsc:${i}`" :size="16" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="localValue" class="selection_default selected">
      {{ localValue }}
    </div>
    <div v-else class="selection_default">
      {{ placeholder }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const { data: allIcons } = await useFetch('/internal/icons');

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Выбрать иконку',
  },
});

const opened = ref(false);

const localValue = computed({
  get() { return props.modelValue; },
  set(val) { emit('update:modelValue', val); },
});

const toggle = () => opened.value = !opened.value;

const select = (i: string) => {
  localValue.value = i;
};
</script>

<style lang="scss" scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
.selection{
  width: 100%;
  min-width: 160px;
  border: 1px solid #E0DAD1;
  border-radius: 6px;
  font-family: $text-font;
  font-size: 14px;
  min-height: 45px;
  background: $white;
  padding: 0 16px;
  color: $brown;
  position: relative;
  &.opened{
    z-index: 3;
    .selection_default:after{
      transform: rotateX(180deg);
    }
  }
  &_options{
    position: absolute;
    width: 100%;
    top: 100%;
    left: 0;
    margin-top: 5px;
    border-radius: 12px;
    box-sizing: border-box;
    border: 1px solid $semi-grey;
    background: $white;
    padding: 5px;
    &-scroll{
      padding: 0 2px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(24px, 1fr));
      gap: 5px;
      max-height: 150px;
      overflow-y: auto;
      &::-webkit-scrollbar{
        width: 4px;
        background: $pinky;
        border-radius: 2px;
        &-thumb{
          background: $light-brown;
          border-radius: 2px;
        }
      }
    }
    .option{
      box-sizing: border-box;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: transparent;
      transition: background .3s ease;
      aspect-ratio: 1 / 1;
      &:hover{
        background: $semi-grey;
      }
    }
  }
  &_default{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
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
