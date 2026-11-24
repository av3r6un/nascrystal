<template>
  <section class="category-order panel_section">
    <div class="panel_section-title">
      {{ t('panel.catalog.categories') }}
    </div>
    <p>{{ t('panel.catalog.order_hint') }}</p>
    <ol class="category-order_list">
      <li
        v-for="(category, index) in draft"
        :key="category.id"
        class="section_item category-order_item"
        :class="{ 'is-dragging': draggedId === category.id, 'is-target': targetId === category.id }"
        :draggable="!busy"
        @dragstart="startDrag($event, category.id)"
        @dragover.prevent="targetId = category.id"
        @drop.prevent="drop(category.id)"
        @dragend="endDrag"
      >
        <div class="category-order_reposition">
          <button
            type="button"
            class="category-order_move"
            :aria-label="t('panel.catalog.move_up', { name: category.name })"
            :disabled="busy || index === 0"
            @click="move(index, index - 1)"
          >
            <Icon name="nsc:arrow-up" :size="24" :disabled="busy || index === 0" />
          </button>
          <button
            type="button"
            class="category-order_move"
            :aria-label="t('panel.catalog.move_down', { name: category.name })"
            :disabled="busy || index === draft.length - 1"
            @click="move(index, index + 1)"
          >
            <Icon name="nsc:arrow-down" :size="24" :disabled="busy || index === draft.length - 1" />
          </button>
        </div>
        <span class="category-order_name">{{ category.name }}</span>
        <button
          v-if="category.empty"
          type="button"
          class="btn btn_action"
          :title="t('panel.catalog.delete_category')"
          :aria-label="t('panel.catalog.delete_category')"
          :disabled="busy"
          @click="emit('delete', category.id)"
        >
          <Icon name="nsc:trash" :size="14" />
        </button>
      </li>
    </ol>
    <p v-if="!draft.length">
      {{ t('panel.catalog.categories_empty') }}
    </p>
    <p v-if="saveError" role="alert">
      {{ t('panel.catalog.order_error') }}
    </p>
    <p v-if="deleteError" role="alert">
      {{ deleteError }}
    </p>
    <p v-if="saved" role="status">
      {{ t('panel.catalog.order_saved') }}
    </p>
    <button type="button" class="btn btn_submit" :disabled="busy || !dirty" @click="save">
      {{ t(saving ? 'default.loading' : 'panel.submit') }}
    </button>
  </section>
</template>

<script setup lang="ts">
type Category = { id: number; name: string; sort_order: number; empty?: boolean };
const props = defineProps<{ categories: Category[]; deleting: boolean; deleteError: string | null }>();
const emit = defineEmits<{ saved: [categories: Category[]]; delete: [id: number] }>();
const { t } = useI18n();
const auth = useAuthStore();
const draft = ref<Category[]>([]);
const baseline = ref<number[]>([]);
const draggedId = ref<number | null>(null);
const targetId = ref<number | null>(null);
const saving = ref(false);
const busy = computed(() => saving.value || props.deleting);
const saveError = ref(false);
const saved = ref(false);
const dirty = computed(() => draft.value.some((item, index) => item.id !== baseline.value[index]));

watch(() => props.categories, (categories) => {
  if (saving.value) return;
  if (dirty.value) {
    const categoriesById = new Map(categories.map(category => [category.id, category]));
    draft.value = draft.value.flatMap(({ id }) => categoriesById.get(id) ?? []);
    baseline.value = baseline.value.filter(id => categoriesById.has(id));
    return;
  }
  draft.value = [...categories].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  baseline.value = draft.value.map(item => item.id);
}, { immediate: true });

const move = (from: number, to: number) => {
  if (busy.value || from < 0 || to < 0 || to >= draft.value.length || from === to) return;
  const item = draft.value.splice(from, 1)[0];
  if (item) draft.value.splice(to, 0, item);
  saved.value = false;
  saveError.value = false;
};
const startDrag = (event: DragEvent, id: number) => {
  if (busy.value) {
    event.preventDefault();
    return;
  }
  draggedId.value = id;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(id));
  }
};
const endDrag = () => {
  draggedId.value = null;
  targetId.value = null;
};
const drop = (id: number) => {
  if (draggedId.value !== null) {
    move(draft.value.findIndex(item => item.id === draggedId.value), draft.value.findIndex(item => item.id === id));
  }
  endDrag();
};
const save = async () => {
  if (busy.value || !dirty.value) return;
  saving.value = true;
  saveError.value = false;
  saved.value = false;
  try {
    if (!await auth.ensureValidAccessToken()) throw new Error('Unauthorized');
    const response = await $fetch<{ items: Category[] }>('/internal/catalog/categories', {
      method: 'PATCH',
      headers: auth.authHeader,
      body: { items: draft.value.map((item, index) => ({ id: item.id, sort_order: index })) },
    });
    const emptyById = new Map(props.categories.map(category => [category.id, category.empty]));
    const categories = response.items.map(category => ({ ...category, empty: emptyById.get(category.id) }));
    draft.value = [...categories].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    baseline.value = draft.value.map(item => item.id);
    emit('saved', categories);
    saved.value = true;
  }
  catch {
    saveError.value = true;
  }
  finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.category-order{
  &_list{
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    padding: 0;
    list-style: none;
  }
  &_item{
    display: flex;
    align-items: center;
    width: 100%;
    gap: 5px;
    padding: 0 6px;
    cursor: grab;
    &.is-dragging{ opacity: .5; }
    &.is-target{ background: $light-pink; }

  }
  &_reposition{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 5px;
  }
  &_move{
    display: flex;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    &:disabled{ cursor: not-allowed; }
  }
  &_name{ flex: 1; }
}
</style>
