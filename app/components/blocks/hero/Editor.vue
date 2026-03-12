<template>
  <div class="hero_editor panel_section" :class="{ collapsed }">
    <div class="hero_editor-title">
      <span>
        {{ t('editor.blockHero') }}
      </span>
      <button type="button" class="btn btn_small" @click="toggleBlock">
        <Icon :name="`nsc:toggle-${collapsed ? 'down' : 'up'}`" :size="24" />
      </button>
    </div>
    <CmsElementsImage
      v-model="content.image"
      name="content.image"
      caption="content.image_caption"
    />
    <CmsElementsInput v-model="content.title" name="content.title" />
    <CmsElementsInput v-model="content.subtitle" name="content.subtitle" />
    <CmsElementsInput v-model="content.button_text" name="content.button_text" />
    <CmsElementsInput v-model="content.button_to" name="content.button_to" />
    <CmsElementsCheckbox
      v-for="(state, opt, idx) in options"
      :key="idx"
      :model-value="state"
      :title="`panel.options.${opt}.title`"
      :description="`panel.options.${opt}.caption`"
      @update:model-value="(value) => updateState(opt, value)"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const collapsed = ref(false);
const toggleBlock = () => collapsed.value = !collapsed.value;

const local = computed({
  get: () => props.modelValue ?? {},
  set: value => emit('update:modelValue', value),
});
const content = computed({
  get: () => local.value.content ?? {},
  set: value => local.value = { ...local.value, content: value },
});
const options = computed({
  get: () => local.value.options ?? {},
  set: val => local.value = { ...local.value, options: val },
});
const updateState = (opt: string, value: Record<string, unknown>) => {
  const next = { ...options.value };
  next[opt] = value;
  options.value = next;
};
</script>

<style lang="scss" scoped>
.hero_editor{
  max-height: 2100px;
  height: auto;
  transition: all .8s ease;
  &.collapsed{
    overflow: hidden;
    max-height: 98px;
  }
  &-title{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: $title-font;
    font-size: 24px;
    font-weight: bold;
    color: $brown;
    .m-icon{
      display: flex;
    }
  }
}
</style>
