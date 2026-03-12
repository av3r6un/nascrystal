export const useBlocks = () => {
  const modules = import.meta.glob(
    '~/components/blocks/*/schema.ts',
    { eager: true },
  );
  const blocks = {};

  for (const path in modules) {
    const schema = modules[path].default;
    blocks[schema.name] = schema;
  }

  return blocks;
};
