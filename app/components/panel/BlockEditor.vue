<template>
  <div class="panel_block-editor">
    <div class="panel_block-editor__title">
      {{ t('editor.title') }}
    </div>
    <CmsBlockEditor
      v-for="(block, idx) in local"
      :key="getBlockKey(block)"
      :model-value="block"
      :last="isLastBlock(idx)"
      :index="idx"
      @update:model-value="(v) => updateBlock(idx, v)"
      @move="(dir) => moveBlock(idx, dir)"
      @remove="removeBlock(idx)"
    />
    <CmsBlockSelector v-if="blockSelectorShown" v-model="newBlock" />
    <button type="button" class="btn btn_add" @click="pendingNewBlock">
      {{ t('panel.add_block') }}
    </button>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();
const reusable = useReusable();
const blocks = useBlocks();
const blockSelectorShown = ref(false);
const newBlock = ref('');
let nextBlockId = 1;

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ([]),
  },
});

const local = computed({
  get: () => props.modelValue ?? [],
  set: val => emit('update:modelValue', val),
});

const getBlockKey = (block: Record<string, unknown>) => {
  const existing = block.__editorKey;
  if (typeof existing === 'number') return existing;

  const created = nextBlockId++;
  Object.defineProperty(block, '__editorKey', {
    value: created,
    enumerable: false,
    writable: false,
  });
  return created;
};

const pendingNewBlock = () => blockSelectorShown.value = true;
const updateBlock = (idx: number, value: Record<string, unknown>) => {
  const next = [...local.value];
  const currentKey = next[idx]?.__editorKey;
  if (typeof currentKey === 'number') {
    Object.defineProperty(value, '__editorKey', {
      value: currentKey,
      enumerable: false,
      writable: false,
    });
  }
  next[idx] = value;
  local.value = next;
};

watch(newBlock, (value) => {
  if (!value) return;

  let nextBlock: Record<string, unknown> | null = null;

  if (value.startsWith('switch.')) {
    const switchBlock = value.slice('switch.'.length);
    if (!switchBlock || !reusable[switchBlock]) {
      console.warn(`[edithome] Unknown reusable switch block "${switchBlock}"`);
      newBlock.value = '';
      blockSelectorShown.value = false;
      return;
    }

    nextBlock = {
      switch: {
        block: switchBlock,
        show: true,
      },
    };
  }
  else {
    const rawDefault = blocks[value]?.default;
    const blockDefault = (rawDefault && typeof rawDefault === 'object')
      ? structuredClone(rawDefault)
      : {};

    nextBlock = {
      [value]: blockDefault,
    };
  }

  Object.defineProperty(nextBlock, '__editorKey', {
    value: nextBlockId++,
    enumerable: false,
    writable: false,
  });

  local.value = [...local.value, nextBlock];
  newBlock.value = '';
  blockSelectorShown.value = false;
});

const moveBlock = (idx: number, direction: number) => {
  const target = idx + direction;
  if (target < 0 || target >= local.value.length) return;

  const next = [...local.value];
  [next[idx], next[target]] = [next[target], next[idx]];
  console.log(next);
  local.value = next;
};
const removeBlock = (idx: number) => {
  local.value = [...local.value.filter((_, index) => index !== idx)];
};
const isLastBlock = (idx: number) => idx + 1 === local.value.length;
</script>

<style lang="scss" scoped>
.panel_block-editor{
  display: grid;
  gap: 16px;
  width: 100%;
  &__title{
    font-family: $title-font;
    font-size: 24px;
    font-weight: bold;
    color: $brown;
  }
  .btn_add{
    justify-self: flex-start;
  }
}
</style>
