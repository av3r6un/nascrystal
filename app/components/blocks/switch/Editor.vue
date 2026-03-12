<template>
  <div class="panel_section">
    <div class="checkbox">
      <div class="checkbox_info">
        <div class="checkbox_title">
          {{ t(`editor.${localValue.block}`) }}
        </div>
        <div class="checkbox_description">
          {{ t('editor.section_caption') }}
        </div>
      </div>
      <div class="checkbox_checkbox" :class="{ checked: isChecked }" @click="toggle">
        <input type="checkbox" class="inv_input checkbox_check" :checked="isChecked">
        <div class="checkbox_check" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: [Object, Boolean],
    default: () => ({}),
  },
});
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const localValue = computed<{ block: string; show: boolean }>({
  get: () => {
    if (typeof props.modelValue === 'boolean') {
      return { block: '', show: props.modelValue };
    }

    const next = (props.modelValue && typeof props.modelValue === 'object')
      ? props.modelValue as Record<string, unknown>
      : {};

    return {
      block: typeof next.block === 'string' ? next.block : '',
      show: Boolean(next.show),
    };
  },
  set: (value) => emit('update:modelValue', { ...value }),
});

const isChecked = computed(() => localValue.value.show);
const toggle = () => {
  localValue.value = {
    ...localValue.value,
    show: !localValue.value.show,
  };
};
</script>

<style lang="scss" scoped>
.checkbox{
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 5px;
  &_title{
    font-size: 22px;
    font-family: $title-font;
    color: $brown;
    font-weight: bold;
    margin-bottom: 4px;
  }
  &_info{
    @media screen {
      @media (max-width: 408px) {
        max-width: calc(100% - 50px);
      }
    }
  }
  &_description{
    color: $light-brown;
  }
  &_checkbox{
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
      .checkbox_check{
        left: calc(100% - 21px);
        background: $white;
      }
    }
  }
  &_check{
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
