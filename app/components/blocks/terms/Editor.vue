<template>
  <div ref="root" class="terms_editor panel_section" :class="{ collapsed }">
    <div ref="cont" class="terms_editor-wrapper">
      <div class="terms_editor-title">
        <span>{{ t('editor.terms') }}</span>
        <button type="button" class="btn btn_small" @click="toggleBlock">
          <Icon :name="`nsc:toggle-${collapsed ? 'down' : 'up'}`" :size="24" />
        </button>
      </div>

      <div class="terms_editor-body">
        <div v-for="(s, sIdx) in content" :key="sIdx" class="terms_editor-section">
          <div class="terms_editor-row">
            <input
              :value="asText(s.title)"
              type="text"
              :placeholder="t('panel.title')"
              autocomplete="off"
              class="input_wide"
              @input="(e) => updateSectionTitle(sIdx, (e.target as HTMLInputElement).value)"
            >
            <div class="terms_editor-actions">
              <button type="button" class="btn btn_small" @click="addSectionItem(sIdx)">
                <Icon name="nsc:plus-small" :size="16" />
              </button>
              <button type="button" class="btn btn_small" @click="removeSection(sIdx)">
                <Icon name="nsc:trash" :size="18" />
              </button>
            </div>
          </div>

          <div class="terms_editor-items">
            <div v-for="(item, iIdx) in asItems(s.items)" :key="iIdx" class="terms_editor-item">
              <textarea
                :value="item.caption"
                type="text"
                :placeholder="t('panel.text')"
                autocomplete="off"
                class="input_wide"
                @input="(e) => inputChanges(sIdx, iIdx, e.target as HTMLTextAreaElement)"
              />
              <button type="button" class="btn btn_small" @click="removeSectionItem(sIdx, iIdx)">
                <Icon name="nsc:trash" :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="btn btn_add" @click="addSection">
        <Icon name="nsc:plus-small" :size="16" />
        {{ t('panel.button_add') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
type TermsEntry = {
  caption: string;
};

type TermsItem = {
  title: string;
  items: TermsEntry[];
};

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

const asText = (value: unknown) => typeof value === 'string' ? value : '';
const asItems = (value: unknown): TermsEntry[] => Array.isArray(value)
  ? value
      .filter(item => item && typeof item === 'object')
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          caption: asText(row.caption),
        };
      })
  : [];

const content = computed<TermsItem[]>(() => {
  const model = (props.modelValue && typeof props.modelValue === 'object')
    ? props.modelValue as Record<string, unknown>
    : {};

  if (!Array.isArray(model.content)) return [];
  return model.content
    .filter(item => item && typeof item === 'object')
    .map((section) => {
      const row = section as Record<string, unknown>;
      return {
        title: asText(row.title),
        items: asItems(row.items),
      };
    });
});

const setContent = (nextContent: TermsItem[]) => {
  const model = (props.modelValue && typeof props.modelValue === 'object')
    ? props.modelValue as Record<string, unknown>
    : {};
  emit('update:modelValue', { ...model, content: nextContent });
};

const updateSectionTitle = (sIdx: number, title: string) => {
  const next = content.value.map((s, idx) => (idx === sIdx ? { ...s, title } : s));
  setContent(next);
};

const updateSectionItem = (sectionIdx: number, itemIdx: number, value: string) => {
  const next = content.value.map((section, idx) => {
    if (idx !== sectionIdx) return section;
    return {
      ...section,
      items: section.items.map((item, i) => (i === itemIdx ? { ...item, caption: value } : item)),
    };
  });
  setContent(next);
};

const addSectionItem = (sectionIdx: number) => {
  const next = content.value.map((section, idx) => {
    if (idx !== sectionIdx) return section;
    return {
      ...section,
      items: [...section.items, { caption: '' }],
    };
  });
  setContent(next);
};

const removeSectionItem = (sectionIdx: number, itemIdx: number) => {
  const next = content.value.map((section, idx) => {
    if (idx !== sectionIdx) return section;
    return {
      ...section,
      items: section.items.filter((_, i) => i !== itemIdx),
    };
  });
  setContent(next);
};

const addSection = () => {
  setContent([...content.value, { title: '', items: [] }]);
};

const removeSection = (sectionIdx: number) => {
  setContent(content.value.filter((_, idx) => idx !== sectionIdx));
};

const inputChanges = (section: number, item: number, e: HTMLTextAreaElement) => {
  e.style.height = 'auto';
  e.style.height = `${Math.min(e.scrollHeight, 240)}px`;
  updateSectionItem(section, item, (e).value);
};
</script>

<style lang="scss" scoped>
.terms_editor{
  height: auto;
  transition: all .8s ease;
  &.collapsed{
    overflow: hidden;
    max-height: 98px !important;
  }
  &-wrapper{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    overflow: hidden;
  }
  &-title{
    width: 100%;
    font-family: $title-font;
    font-weight: bold;
    color: $brown;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .m-icon{
      display: flex;
    }
  }
  &-body{
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
    .input_wide{
      margin-bottom: 0;
    }
  }
  &-row{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    .input_wide{
      border-bottom-left-radius: 0;
      border-color: $light-brown;
    }
  }
  &-items{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-left: 10px;
  }
  &-item{
    display: flex;
    position: relative;
    textarea.input_wide{
      padding: 6px 12px;
      min-height: 40px;
      max-height: 240px;
      resize: none;
      height: auto;
    }
    &:before{
      position: absolute;
      content: '';
      top: -15px;
      left: -10px;
      height: calc(100% + 30px);
      width: 1px;
      background: $light-brown;
    }
    &:last-child{
      &:before{
        height: calc(50% + 15px);
      }
    }
    &:after{
      position: absolute;
      content: '';
      left: -10px;
      height: 1px;
      width: 10px;
      background: $light-brown;
      top: calc(50% - 1px);
    }
  }
  &-section{
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  &-actions{
    display: flex;
    gap: 6px;
  }
}
</style>
