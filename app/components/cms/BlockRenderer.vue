<template>
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
});
const getBlockName = (block: object) => Object.keys(block)[0];

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

<style>

</style>
