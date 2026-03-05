<template>
  <div class="page_editor">
    <form class="page_editor-form" @submit.prevent="savePage">
      <div class="page_editor-title base_title"
        v-if="!form.id">{{ t('panel.static.new.add_page') }}</div>
      <PanelNamedInput
        v-model="form.slug"
        type="text"
        :name="t('panel.static.new.slug')"
        required
      />
      <PanelNamedInput
        v-model="form.title"
        type="text"
        :name="t('panel.title')"
        required
      />
      <PanelNamedInput
        v-model="form.description"
        type="text"
        :name="t('panel.static.forms.description')"
      />
      <div class="page_editor-form__section">
        {{ t('panel.static.forms.metatags') }}
      </div>
      <PanelNamedInput
        v-model="form.meta_title"
        type="text"
        :name="t('panel.static.new.meta_title')"
      />
      <PanelNamedInput
        v-model="form.meta_description"
        type="text"
        :name="t('panel.static.new.meta_description')"
      />
      <PanelNamedCheckbox
        v-model="form.status"
        :title="t('panel.static.new.draft')"
        :states="['draft', 'published']"
        :description="t('panel.static.new.draft_caption')"
      />
      <PanelImageForm
        v-model="form.og_image"
        :name="t('panel.img_placeholder')"
        :caption="t('panel.img_placeholder_caption')"
      />
      <button type="submit" class="btn btn_submit" :disabled="!isDirty">
        {{ t('panel.submit') }}
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const props = defineProps<{ modelValue: PageForm }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: PageForm): void; (e: 'save'): void }>();

const serialize = (value: unknown) => JSON.stringify(value ?? {});
const cloneValue = <T>(value: T): T => JSON.parse(serialize(value)) as T;
const getEntityId = (value: PageForm) => value?.id ?? null;

const form = reactive(cloneValue(props.modelValue));
const baseline = ref(cloneValue(props.modelValue));
const baselineEntityId = ref(getEntityId(props.modelValue));

watch(() => props.modelValue, (v) => {
  Object.assign(form, v);

  const incomingEntityId = getEntityId(v);
  if (incomingEntityId !== baselineEntityId.value) {
    baseline.value = cloneValue(v);
    baselineEntityId.value = incomingEntityId;
  }
}, { deep: true });

watch(form, v => emit('update:modelValue', { ...v }), { deep: true });
const isDirty = computed(() => serialize(form) !== serialize(baseline.value));
const savePage = () => emit('save');
</script>

<style lang="scss" scoped>
.page_editor{
  background: $light-pink;
  padding: 32px;
  border-radius: 8px;
  &-form{
    display: flex;
    flex-direction: column;
    gap: 32px;
    .base_title{
      text-align: center;
    }
    &__section {
      padding: 0 8px;
      font-family: $title-font;
      font-weight: bold;
      color: $brown;
      font-size: 24px;
    }
  }
}
</style>
