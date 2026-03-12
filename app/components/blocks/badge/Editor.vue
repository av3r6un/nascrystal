<template>
  <div class="badge_editor panel_section" :class="{ collapsed }">
    <div class="badge_editor-title">
      <span>
        {{ t('editor.badge') }}
      </span>
      <button type="button" class="btn btn_small" @click="toggleBlock">
        <Icon :name="`nsc:toggle-${collapsed ? 'down' : 'up'}`" :size="24" />
      </button>
    </div>
    <CmsElementsInput v-model="content.title" name="content.title" />
    <CmsElementsInput v-model="content.description" name="content.description" />
    <CmsElementsInput v-model="content.button_text" name="content.button_text" />
    <CmsElementsInput v-model="content.button_to" name="content.button_to" />
    <CmsElementsImage v-model="content.image" name="content.image" caption="content.image_caption" />
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

const content = computed({
  get: () => props.modelValue ?? {},
  set: val => emit('update:modelValue', val),
});
</script>

<style lang="scss" scoped>
.badge_editor{
  max-height: 2100px;
  height: auto;
  transition: all .8s ease;
  &.collapsed{
    overflow: hidden;
    max-height: 98px;
  }
  &-title{
    font-family: $title-font;
    font-size: 24px;
    font-weight: bold;
    color: $brown;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    .m-icon{
      display: flex;
    }
  }
}
</style>
