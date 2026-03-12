<template>
  <div class="cms_block-editor__wrapper">
    <div v-show="editorComponent" class="cms_block-editor__reposition">
      <div class="cms_block-editor__up">
        <Icon name="nsc:arrow-up" :size="24" :disabled="index < 1" @click="moveUp" />
      </div>
      <div class="cms_block-editor__down">
        <Icon name="nsc:arrow-down" :size="24" :disabled="last" @click="moveDown" />
      </div>
    </div>
    <div v-if="!editorComponent" class="cms_block-editor__empty">
      Unknown block
    </div>
    <component :is="editorComponent" v-else v-model="payload" class="cms_block-editor" />
    <div class="cms_block-editor__remove" @click="remove">
      <Icon name="nsc:trash" :size="24" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ modelValue: Record<string, unknown>; index: number; last: boolean }>();
const emit = defineEmits(['update:modelValue', 'move', 'remove']);

const blocks = useBlocks();
const blockComponents = useBlockComponents();
const blockName = computed(() => Object.keys(props.modelValue ?? {})[0] ?? '');
const schema = computed(() => blockName.value ? blocks[blockName.value] : null);
const editorComponent = computed(() => {
  if (!schema.value) return null;
  const folder = `${schema.value.component}`.split('/')[0];
  return blockComponents[`${folder}/Editor`] ?? null;
});
const payload = computed({
  get() {
    if (!blockName.value) return {};
    return props.modelValue[blockName.value] ?? {};
  },
  set(value) {
    if (!blockName.value) return;
    const next = { ...props.modelValue };
    next[blockName.value] = value;
    emit('update:modelValue', next);
  },
});
const moveUp = () => emit('move', -1);
const moveDown = () => emit('move', 1);
const remove = () => emit('remove');
</script>

<style lang="scss" scoped>
.cms_block-editor{
  width: 100%;
  &__wrapper{
    width: 100%;
    display: flex;
    gap: 6px;
    padding: 0 6px;
    align-items: center;
  }
  &__reposition{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
  }
  &__up,
  &__down{
    display: flex;
    cursor: pointer;
    &:has(.m-icon[disabled=true]){
      cursor: not-allowed;
    }
  }
}
.cms_block-editor__empty{
  color: $light-brown;
  margin-top: 16px;
}
</style>
