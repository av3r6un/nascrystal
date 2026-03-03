<template>
  <div class="benefit">
    <div class="benefit_inputs">
      <div class="benefit_row">
        <input
          v-model="localValue.text"
          type="text"
          :placeholder="t('panel.text')"
          autocomplete="off"
          class="input_wide"
        >
        <PanelIconSelection
          v-model="localValue.icon"
          :placeholder="t('panel.choose_icon')"
        />
      </div>
      <div class="benefit_row">
        <input
          v-model="localValue.caption"
          type="text"
          :placeholder="t('panel.caption')"
          autocomplete="off"
          class="input_wide"
        >
      </div>
    </div>
    <div class="benefit_action">
      <Icon name="nsc:trash" :size="24" @click="sendDelete" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const emit = defineEmits(['update:modelValue', 'delete']);
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const sendDelete = () => emit('delete');

const localValue = computed({
  get() { return props.modelValue; },
  set(val) { emit('update:modelValue', val); },
});
</script>

<style lang="scss" scoped>
.benefit{
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  &_action{
    margin-top: 8px;
  }
  &_row{
    display: flex;
    gap: 8px;
  }
  &_inputs{
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    .input_wide{
      margin-bottom: 0;
    }
    .selection{
      width: 50%;
    }
  }
}
</style>
