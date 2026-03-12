export const useBlockComponents = () => {
  const modules = import.meta.glob(
    '~/components/blocks/*/*.vue',
    { eager: true },
  );

  const components = {};

  for (const path in modules) {
    const name = path
      .split('/')
      .slice(-2)
      .join('/')
      .replace('.vue', '');

    components[name] = modules[path].default;
  }
  return components;
};
