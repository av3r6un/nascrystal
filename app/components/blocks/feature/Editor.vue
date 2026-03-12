<template>
  <div class="feature_editor panel_section" :class="{ collapsed }">
    <div class="feature_editor-title">
      <span>
        {{ t('editor.feature') }}
      </span>
      <button type="button" class="btn btn_small" @click="toggleBlock">
        <Icon :name="`nsc:toggle-${collapsed ? 'down' : 'up'}`" :size="24" />
      </button>
    </div>
    <div class="feature_editor-body">
      <div v-for="(item, idx) in content" :key="idx" class="feature_editor-item">
        <div class="feature_editor-column">
          <div class="feature_editor-row">
            <input
              :value="asText(item.title)"
              type="text"
              :placeholder="t('panel.text')"
              autocomplete="off"
              required
              class="input_wide"
              @input="(e) => updateItem(idx, 'title', (e.target as HTMLInputElement).value)"
            >
            <CmsElementsIcons
              :model-value="asText(item.icon)"
              :placeholder="t('panel.choose_icon')"
              @update:model-value="(value) => updateItem(idx, 'icon', value)"
            />
          </div>
          <div class="feature_editor-row">
            <input
              :value="asText(item.info)"
              type="text"
              class="input_wide"
              :placeholder="t('panel.caption')"
              autocomplete="off"
              @input="(e) => updateItem(idx, 'info', (e.target as HTMLInputElement).value)"
            >
          </div>
        </div>
        <div class="feature_editor-action">
          <Icon name="nsc:trash" :size="24" @click="remove(idx)" />
        </div>
      </div>
    </div>
    <button type="button" class="btn btn_add" @click="add">
      <Icon name="nsc:plus-small" :size="16" />
      {{ t('panel.button_add') }}
    </button>
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

const content = computed<Array<Record<string, unknown>>>(() => {
  const model = (props.modelValue && typeof props.modelValue === 'object')
    ? props.modelValue as Record<string, unknown>
    : {};
  return Array.isArray(model.content)
    ? model.content.filter(item => item && typeof item === 'object') as Array<Record<string, unknown>>
    : [];
});

const asText = (value: unknown) => typeof value === 'string' ? value : '';
const setContent = (nextContent: Array<Record<string, unknown>>) => {
  const model = (props.modelValue && typeof props.modelValue === 'object')
    ? props.modelValue as Record<string, unknown>
    : {};

  emit('update:modelValue', {
    ...model,
    content: nextContent,
  });
};

const updateItem = (idx: number, key: string, value: string) => {
  const next = content.value.map((item, index) => (index === idx ? { ...item, [key]: value } : item));
  setContent(next);
};

const add = () => {
  setContent([...content.value, { title: '', info: '', icon: 'star' }]);
};
const remove = (idx: number) => {
  setContent(content.value.filter((_, index) => index !== idx));
};
</script>

<style lang="scss" scoped>
.feature_editor{
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
    width: 100%;
    font-family: $title-font;
    font-size: 24px;
    font-weight: bold;
    color: $brown;
    .m-icon{
      display: flex;
    }
  }
  align-items: flex-start;
  .btn_add{
    display: flex;
    cursor: pointer;
  }
  &-body{
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }
  &-item{
    display: flex;
    width: 100%;
    gap: 12px;
    .input_wide{
      margin-bottom: 0;
    }
    .selection{
      width: 50%;
    }
  }
  &-action{
    margin-top: 8px;
    .m-icon{
      cursor: pointer;
    }
  }
  &-column{
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  &-row{
    display: flex;
    gap: 8px;
  }
}
</style>
