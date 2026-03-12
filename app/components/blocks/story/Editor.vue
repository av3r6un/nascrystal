<template>
  <div ref="root" class="story_editor panel_section" :class="{ collapsed }">
    <div ref="cont" class="story_editor-wrapper">
      <div class="story_editor-title">
        <span>
          {{ t('editor.story') }}
        </span>
        <button type="button" class="btn btn_small" @click="toggleBlock">
          <Icon :name="`nsc:toggle-${collapsed ? 'down': 'up'}`" :size="24" />
        </button>
      </div>
      <div class="story_editor-body">
        <div class="story_editor-row">
          <CmsElementsImage
            v-model="image"
            name="content.image"
            caption="content.image_caption"
          />
        </div>
        <div class="story_editor-item__title">
          {{ t('editor.paragraphs') }}
        </div>
        <div v-for="(item, idx) in content" :key="idx" class="story_editor-item">
          <input
            :value="item"
            type="text"
            :placeholder="t('panel.text')"
            autocomplete="off"
            required
            class="input_wide"
            @change="(e) => updateItem(idx, (e.target as HTMLInputElement).value)"
          >
          <div class="story_editor-action">
            <Icon name="nsc:trash" :size="20" @click="remove(idx)" />
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
const image = computed({
  get: () => {
    const model = (props.modelValue && typeof props.modelValue === 'object')
      ? props.modelValue as Record<string, unknown>
      : {};
    return model.image ?? null;
  },
  set: (value: unknown) => {
    const model = (props.modelValue && typeof props.modelValue === 'object')
      ? props.modelValue as Record<string, unknown>
      : {};
    emit('update:modelValue', {
      ...model,
      image: value,
    });
  },
});
const content = computed<string[]>(() => {
  const model = (props.modelValue && typeof props.modelValue === 'object')
    ? props.modelValue as Record<string, unknown>
    : {};
  return Array.isArray(model.content)
    ? model.content.filter((item): item is string => typeof item === 'string')
    : [];
});

const setContent = (nextContent: string[]) => {
  const model = (props.modelValue && typeof props.modelValue === 'object')
    ? props.modelValue as Record<string, unknown>
    : {};

  emit('update:modelValue', {
    ...model,
    content: nextContent,
  });
};

const updateItem = (idx: number, value: string) => {
  const next = content.value.map((item, index) => (index === idx ? value : item));
  setContent(next);
};

const add = () => {
  setContent([...content.value, '']);
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
.story_editor{
  height: auto;
  transition: all .5s ease;
  align-items: flex-start;
  &.collapsed {
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
    display: flex;
    gap: 8px;
  }
  &-action{
    margin-top: 8px;
    .m-icon{
      cursor: pointer;
    }
  }

}
</style>
