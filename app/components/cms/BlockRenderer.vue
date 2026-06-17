<template>
  <div v-if="isDoc" class="redaction_date">
    {{ t('default.redaction') }} {{ d(redactionDate, 'document') }}
  </div>
  <component
    :is="resolve(block)"
    v-for="(block, i) in blocks"
    v-show="showSwitch(block)"
    :key="i"
    :model-value="blockPayload(block)"
    :class="`${parent}_block`"
  />
</template>

<script lang="ts" setup>
const blocksRegistry = useBlocks();
const blockComponents = useBlockComponents();
const props = defineProps({
  blocks: {
    type: Array,
    required: true,
  },
  parent: {
    type: String,
    required: false,
  },
  updated: {
    type: Number,
    required: false,
  },
});
const getBlockName = (block: object) => Object.keys(block)[0];

const { t, d } = useI18n();

const isDoc = computed(() => props.blocks.some(b => Object.keys(b).includes('terms')));
const redactionDate = computed(() => {
  const date = new Date(props.updated * 1000);
  return date.toISOString();
});
const resolve = (block: object) => {
  const name = getBlockName(block);
  const schema = blocksRegistry[name];

  if (!schema) return null;
  const folder = `${schema.component}`.split('/')[0];
  return blockComponents[`${folder}/View`] ?? null;
};

const blockPayload = (block: Record<string, unknown>) => {
  const name = getBlockName(block);
  return block[name] ?? {};
};
const showSwitch = (block: object) => {
  if (!block?.switch) return true;
  return block.switch.show;
};
</script>

<style lang="scss" scoped>
.redaction_date{
  text-align: right;
  color: $light-brown;
}
</style>
