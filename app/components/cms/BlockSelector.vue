<template>
  <div class="block_selector">
    <PanelSelection
      v-model="blockType"
      :options="blockOptions"
      @update:model-value="refactor"
    />
    <PanelSelection
      v-if="blockType === 'switch'"
      v-model="reusableType"
      :options="options"
      :placeholder="t('editor.block_selection')"
      @update:model-value="refactor"
    />
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: String,
  },
});

const localValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const reusable = useReusable();
const blocks = useBlocks();
const blockType = ref('');
const reusableType = ref('');

const selectedType = computed<string>(() => reusableType.value ? `${blockType.value}.${reusableType.value}` : blockType.value);

const { t } = useI18n();

const options = computed(() => Object.entries(reusable).map(([_, k]) => ({ id: k.name, name: k.title })));
const blockOptions = computed(() => Object.entries(blocks).map(([_, k]) => ({ id: k.name, name: `editor.${k.name}` })));
const refactor = () => {
  if (selectedType.value === 'switch') return;
  localValue.value = selectedType.value;
};
</script>

<style lang="scss" scoped>
.block_selector{
  display: flex;
  gap: 20px;
  width: 100%;
}
</style>
