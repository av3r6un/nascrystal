import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/max-attributes-per-line': ['error', {
      singleline: 4,
      multiline: 1,
    }],
    'vue/no-v-html': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',
  }
});
