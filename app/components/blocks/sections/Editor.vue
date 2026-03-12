<template>
  <div ref="root" class="sections_editor panel_section" :class="{ collapsed }">
    <div ref="cont" class="sections_editor-wrapper">
      <div class="sections_editor-title">
        <span>{{ t('editor.sections') }}</span>
        <button type="button" class="btn btn_small" @click="toggleBlock">
          <Icon :name="`nsc:toggle-${collapsed ? 'down' : 'up'}`" :size="24" />
        </button>
      </div>

      <div class="sections_editor-body">
        <div v-for="(section, sectionIdx) in content" :key="sectionIdx" class="sections_editor-section">
          <div class="sections_editor-row">
            <input
              :value="asText(section.title)"
              type="text"
              :placeholder="t('panel.title')"
              autocomplete="off"
              class="input_wide"
              @input="(e) => updateSectionTitle(sectionIdx, (e.target as HTMLInputElement).value)"
            >
            <div class="sections_editor-actions">
              <button type="button" class="btn btn_small" @click="addSectionItem(sectionIdx)">
                <Icon name="nsc:plus-small" :size="16" />
              </button>
              <button type="button" class="btn btn_small" @click="removeSection(sectionIdx)">
                <Icon name="nsc:trash" :size="18" />
              </button>
            </div>
          </div>

          <div class="sections_editor-items">
            <div v-for="(item, itemIdx) in asItems(section.items)" :key="itemIdx" class="sections_editor-item">
              <input
                :value="item"
                type="text"
                :placeholder="t('panel.text')"
                autocomplete="off"
                class="input_wide"
                @input="(e) => updateSectionItem(sectionIdx, itemIdx, (e.target as HTMLInputElement).value)"
              >
              <button type="button" class="btn btn_small" @click="removeSectionItem(sectionIdx, itemIdx)">
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
type SectionItem = {
  title: string;
  items: string[];
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
const asItems = (value: unknown): string[] => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : [];

const content = computed<SectionItem[]>(() => {
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

const setContent = (nextContent: SectionItem[]) => {
  const model = (props.modelValue && typeof props.modelValue === 'object')
    ? props.modelValue as Record<string, unknown>
    : {};

  emit('update:modelValue', {
    ...model,
    content: nextContent,
  });
};

const updateSectionTitle = (sectionIdx: number, title: string) => {
  const next = content.value.map((section, idx) => (idx === sectionIdx ? { ...section, title } : section));
  setContent(next);
};

const updateSectionItem = (sectionIdx: number, itemIdx: number, value: string) => {
  const next = content.value.map((section, idx) => {
    if (idx !== sectionIdx) return section;
    return {
      ...section,
      items: section.items.map((item, i) => (i === itemIdx ? value : item)),
    };
  });
  setContent(next);
};

const addSectionItem = (sectionIdx: number) => {
  const next = content.value.map((section, idx) => {
    if (idx !== sectionIdx) return section;
    return {
      ...section,
      items: [...section.items, ''],
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

// Smooth animation of collapsing
const root = ref<HTMLElement | null>(null);
const cont = ref<HTMLElement | null>(null);
let ro: ResizeObserver | null = null;
let lastApplied = 0;
const DIFF_PX = 4;
const applyMaxHeight = () => {
  if (!root.value || !cont.value) return;

  const h = Math.ceil(cont.value.scrollHeight) + 55;
  const isCollapsed = root.value.classList.contains('collapsed');

  if (!isCollapsed && Math.abs(h - lastApplied) <= DIFF_PX) return;

  root.value.style.maxHeight = `${h}px`;
  lastApplied = h;
};
onMounted(() => {
  applyMaxHeight();
  ro = new ResizeObserver(() => applyMaxHeight());
  if (cont.value) ro.observe(cont.value);
});

onBeforeUnmount(() => ro?.disconnect());
</script>

<style lang="scss" scoped>
.sections_editor{
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
      width: 50%;
      border-color: $light-brown;
      border-bottom-left-radius: 0;
    }
  }
  &-items{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-left: 20px;
  }
  &-item{
    display: flex;
    position: relative;
    &:before{
      position: absolute;
      content: '';
      top: -15px;
      left: -20px;
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
      left: -20px;
      height: 1px;
      width: 15px;
      background: $light-brown;
      top: calc(50% - 1px);
    }
  }
  &-section{
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

}
</style>
