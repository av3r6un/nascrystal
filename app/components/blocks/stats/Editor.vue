<template>
  <div ref="root" class="stats_editor panel_section" :class="{ collapsed }">
    <div ref="cont" class="stats_editor-wrapper">
      <div class="stats_editor-title">
        <span>
          {{ t('editor.stats') }}
        </span>
        <button type="button" class="btn btn_small" @click="toggleBlock">
          <Icon :name="`nsc:toggle-${collapsed ? 'down' : 'up'}`" :size="24" />
        </button>
      </div>
      <div class="stats_editor-body">
        <div v-for="(item, idx) in content" :key="idx" class="stats_editor-item">
          <div class="stats_editor-column">
            <input
              :value="asText(item.title)"
              type="text"
              :placeholder="t('panel.text')"
              autocomplete="off"
              required
              class="input_wide"
              @change="(e) => updateItem(idx, 'title', (e.target as HTMLInputElement).value)"
            >
            <input
              :value="asText(item.caption)"
              type="text"
              :placeholder="t('panel.caption')"
              autocomplete="off"
              required
              class="input_wide"
              @change="(e) => updateItem(idx, 'caption', (e.target as HTMLInputElement).value)"
            >
            <div class="stats_editor-action">
              <Icon name="nsc:trash" :size="20" @click="remove(idx)" />
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="btn btn_add" @click="add">
        <Icon name="nsc:plus-small" :size="16" />
        {{ t('panel.button_add') }}
      </button>
    </div>
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
.stats_editor{
  height: auto;
  transition: all .8s ease;
  align-items: flex-start;
  &.collapsed{
    overflow: hidden;
    max-height: 98px !important;
  }
  &-wrapper{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 20px;
    overflow: hidden;
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
  &-body{
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
    .input_wide{
      margin-bottom: 0;
    }
  }
  &-item{
    width: 100%;
  }
  &-action{
    margin-top: 8px;
    .m-icon{
      cursor: pointer;
    }
  }
  &-column{
    display: flex;
    justify-content: stretch;
    width: 100%;
    gap: 8px;
  }
}
</style>
