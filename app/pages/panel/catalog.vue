<template>
  <article class="catalog">
    <div class="catalog_title base_title">
      {{ t('panel.catalog.title') }}
    </div>
    <div class="catalog_body">
      <div v-if="pending" class="catalog_state">
        Loading...
      </div>
      <div v-else-if="error" class="catalog_state">
        {{ t('panel.catalog_load_error') }}
      </div>
      <div v-else class="catalog_body-content">
        <div class="catalog_body-categories panel_section">
          <div class="catalog_categories-title small_title">
            {{ t('panel.catalog.categories') }}
          </div>
          <div v-if="categories.length >= 1" class="catalog_categories-body">
            <div v-for="cat in categories" :key="cat.uid" class="catalog_categories-item">
              <div class="catalog_category">
                <input v-model="cat.name" type="text" class="input_wide">
                <Icon name="nsc:trash" :size="16" @click="removeCategory(cat.uid)" />
              </div>
            </div>
          </div>
          <div v-else class="catalog_categories-body">
            <p class="warning">
              {{ t('panel.catalog.categories_empty') }}
            </p>
          </div>
          <div class="catalog_categories-new">
            <form
              v-show="showCategoryForm"
              class="catalog_categories-new__form"
              @submit.prevent="addNewCategory"
            >
              <input
                v-model="newCategory.name"
                type="text"
                :placeholder="t('panel.catalog.name')"
                required
                class="input_wide"
              >
              <CmsElementsIcons v-model="newCategory.icon" />
              <button type="submit" class="btn btn_submit small" :disabled="isCreatingCategory">
                <Icon name="nsc:check" :size="24" />
              </button>
            </form>
            <div class="catalog_categories-new__button">
              <button type="button" class="btn btn_add" @click="showCategoryForm = true">
                <Icon name="nsc:plus-small" :size="16" />
                {{ t('panel.catalog.add_category') }}
              </button>
            </div>
          </div>
          <div class="catalog_categories-submit">
            <button type="button" class="btn btn_submit" :disabled="pending || isUpdatingCategories || !categoriesDirty" @click="updateCategories">
              {{ t('panel.catalog.submit') }}
            </button>
          </div>
        </div>
        <div class="catalog_body-sizes panel_section">
          <div class="catalog_sizes-title small_title">
            {{ t('panel.catalog.sizes') }}
          </div>
          <div v-if="sizes.length >= 1" class="catalog_sizes-body">
            <div v-for="(size, idx) in sizes" :key="idx" class="catalog_sizes-item">
              <div class="catalog_size">
                <input v-model="size.sku" type="text" class="input_wide sku">
                <input
                  v-model="size.size_min"
                  type="number"
                  step="1"
                  min="5"
                  class="input_wide"
                >
                <input
                  v-model="size.size_max"
                  type="number"
                  step="1"
                  min="5"
                  class="input_wide"
                >
                <Icon name="nsc:trash" :size="16" @click="removeSize(size.id)" />
              </div>
            </div>
          </div>
          <div v-else class="catalog_sizes-body">
            <p class="warning">
              {{ t('panel.catalog.sizes_empty') }}
            </p>
          </div>
          <div class="catalog_sizes-new">
            <form
              v-show="showSizeForm"
              class="catalog_sizes-new__form"
              @submit.prevent="addNewSize"
            >
              <input
                v-model="newSize.sku"
                type="text"
                :placeholder="t('panel.catalog.sku')"
                required
                class="input_wide sku"
              >
              <input
                v-model="newSize.size_min"
                type="number"
                min="5"
                step="1"
                :placeholder="t('panel.catalog.size_placeholder')"
                required
                class="input_wide"
              >
              <input
                v-model="newSize.size_max"
                type="number"
                min="5"
                step="1"
                :placeholder="t('panel.catalog.size_placeholder')"
                required
                class="input_wide"
              >
              <button type="submit" class="btn btn_submit small" :disabled="isCreatingSize">
                <Icon name="nsc:check" :size="24" />
              </button>
            </form>
            <div class="catalog_sizes-new__button">
              <button type="button" class="btn btn_add" @click="showSizeForm = true">
                <Icon name="nsc:plus-small" :size="16" />
                {{ t('panel.catalog.add_size') }}
              </button>
            </div>
          </div>
          <div class="catalog_sizes-submit">
            <button type="button" class="btn btn_submit" :disabled="pending || isUpdatingSizes || !sizesDirty" @click="updateSizes">
              {{ t('panel.catalog.submit') }}
            </button>
          </div>
        </div>
        <div class="catalog_body-colors panel_section long">
          <div class="catalog_colors-title small_title">
            {{ t('panel.catalog.colors') }}
          </div>
          <div v-if="colors.length >= 1" class="catalog_colors-body">
            <div v-for="(color, idx) in colors" :key="idx" class="catalog_colors-item">
              <div class="catalog_color">
                <input v-model="color.sku" type="text" class="input_wide sku">
                <input v-model="color.name" type="text" class="input_wide">
                <Icon name="nsc:trash" :size="16" @click="removeColor(color.id)" />
              </div>
            </div>
          </div>
          <div v-else class="catalog_colors-body">
            <p class="warning">
              {{ t('panel.catalog.colors_empty') }}
            </p>
          </div>
          <div class="catalog_colors-new">
            <form v-show="showColorForm" class="catalog_colors-new__form" @submit.prevent="addNewColor">
              <input v-model="newColor.sku" :placeholder="t('panel.catalog.sku')" required class="input_wide sku">
              <input v-model="newColor.name" :placeholder="t('panel.catalog.name')" required class="input_wide">
              <button type="submit" class="btn btn_submit small" :disabled="isCreatingColor">
                <Icon name="nsc:check" :size="24" />
              </button>
            </form>
            <div class="catalog_colors-new__button">
              <button type="button" class="btn btn_add" @click="showColorForm = true">
                <Icon name="nsc:plus-small" :size="16" />
                {{ t('panel.catalog.add_color') }}
              </button>
            </div>
          </div>
          <div class="catalog_colors-submit">
            <button type="button" class="btn btn_submit" :disabled="pending || isUpdatingColors || !colorsDirty" @click="updateColors">
              {{ t('panel.catalog.submit') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'catalog',
  layout: 'panel',
});

const { t, locale } = useI18n();
const auth = useAuthStore();

const { data, pending, error, refresh } = await useAsyncData(
  'panel-catalog-page',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    const response = await $fetch('/internal/catalog', {
      params: { locale: locale.value },
      headers: auth.authHeader,
    });
    return response;
  },
  {
    server: false,
    watch: [locale],
    default: () => ({
      categories: [],
      colors: [],
      sizes: [],
    }),
  },
);
const categories = ref<Record<string, unknown>[]>([]);
const colors = ref<Record<string, unknown>[]>([]);
const sizes = ref<Record<string, unknown>[]>([]);
const initialCategories = ref('[]');
const initialColors = ref('[]');
const initialSizes = ref('[]');
const showCategoryForm = ref(false);
const showSizeForm = ref(false);
const showColorForm = ref(false);
const isCreatingCategory = ref(false);
const isCreatingSize = ref(false);
const isCreatingColor = ref(false);
const isUpdatingCategories = ref(false);
const isUpdatingSizes = ref(false);
const isUpdatingColors = ref(false);
const newCategory = ref({
  name: '',
  icon: '',
});
const newSize = ref({
  sku: '',
  size_min: null,
  size_max: null,
});
const newColor = ref({
  sku: '',
  name: '',
});

const cloneItems = (items: unknown) => JSON.parse(JSON.stringify(Array.isArray(items) ? items : []));
const stringifyItems = (items: unknown) => JSON.stringify(items ?? []);

watch(data, (value) => {
  categories.value = cloneItems(value?.categories);
  sizes.value = cloneItems(value?.sizes);
  colors.value = cloneItems(value?.colors);

  initialCategories.value = stringifyItems(categories.value);
  initialSizes.value = stringifyItems(sizes.value);
  initialColors.value = stringifyItems(colors.value);
}, { immediate: true });

const categoriesDirty = computed(() => stringifyItems(categories.value) !== initialCategories.value);
const sizesDirty = computed(() => stringifyItems(sizes.value) !== initialSizes.value);
const colorsDirty = computed(() => stringifyItems(colors.value) !== initialColors.value);

const ensureAuthorized = async () => {
  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};

const addNewCategory = async () => {
  if (isCreatingCategory.value) return;
  isCreatingCategory.value = true;

  try {
    await ensureAuthorized();
    console.log(newCategory.value);

    await $fetch('/internal/catalog/category', {
      method: 'POST',
      body: {
        ...newCategory.value,
        locale: locale.value,
      },
      headers: auth.authHeader,
    });

    newCategory.value = {
      name: '',
      icon: '',
    };
    showCategoryForm.value = false;
    await refresh();
  }
  catch (e) {
    console.error('Failed to create category', e);
  }
  finally {
    isCreatingCategory.value = false;
  }
};

const addNewSize = async () => {
  if (isCreatingSize.value) return;
  isCreatingSize.value = true;

  try {
    await ensureAuthorized();

    await $fetch('/internal/catalog/size', {
      method: 'POST',
      body: {
        ...newSize.value,
        size_from: Number(newSize.value.size_from),
        size_to: Number(newSize.value.size_to),
      },
      headers: auth.authHeader,
    });

    newSize.value = {
      sku: '',
      size_min: null,
      size_max: null,
    };
    await refresh();
  }
  catch (e) {
    console.error('Failed to create size', e);
  }
  finally {
    isCreatingSize.value = false;
  }
};

const addNewColor = async () => {
  if (isCreatingColor.value) return;
  isCreatingColor.value = true;

  try {
    await ensureAuthorized();

    await $fetch('/internal/catalog/color', {
      method: 'POST',
      body: {
        ...newColor.value,
      },
      headers: auth.authHeader,
    });

    newColor.value = {
      sku: '',
      name: '',
    };
    await refresh();
  }
  catch (e) {
    console.error('Failed to create color', e);
  }
  finally {
    isCreatingColor.value = false;
  }
};

const updateCategories = async () => {
  if (!categoriesDirty.value || isUpdatingCategories.value) return;
  isUpdatingCategories.value = true;

  try {
    await ensureAuthorized();

    await $fetch('/internal/catalog/category', {
      method: 'PUT',
      body: categories.value,
      headers: auth.authHeader,
    });

    await refresh();
  }
  catch (e) {
    console.error('Failed to update categories', e);
  }
  finally {
    isUpdatingCategories.value = false;
  }
};

const updateSizes = async () => {
  if (!sizesDirty.value || isUpdatingSizes.value) return;
  isUpdatingSizes.value = true;

  try {
    await ensureAuthorized();

    await $fetch('/internal/catalog/size', {
      method: 'PUT',
      body: sizes.value,
      headers: auth.authHeader,
    });

    await refresh();
  }
  catch (e) {
    console.error('Failed to update sizes', e);
  }
  finally {
    isUpdatingSizes.value = false;
  }
};

const updateColors = async () => {
  if (!colorsDirty.value || isUpdatingColors.value) return;
  isUpdatingColors.value = true;

  try {
    await ensureAuthorized();

    await $fetch('/internal/catalog/color', {
      method: 'PUT',
      body: colors.value,
      headers: auth.authHeader,
    });

    await refresh();
  }
  catch (e) {
    console.error('Failed to update colors', e);
  }
  finally {
    isUpdatingColors.value = false;
  }
};

const removeCategory = async (uid: unknown) => {
  try {
    await ensureAuthorized();

    await $fetch('/internal/catalog/category', {
      method: 'DELETE',
      body: { uid },
      headers: auth.authHeader,
    });

    await refresh();
  }
  catch (e) {
    console.error('Failed to remove category', e);
  }
};

const removeSize = async (id: unknown) => {
  try {
    await ensureAuthorized();

    await $fetch('/internal/catalog/size', {
      method: 'DELETE',
      body: { id },
      headers: auth.authHeader,
    });

    await refresh();
  }
  catch (e) {
    console.error('Failed to remove size', e);
  }
};

const removeColor = async (id: unknown) => {
  try {
    await ensureAuthorized();

    await $fetch('/internal/catalog/color', {
      method: 'DELETE',
      body: { id },
      headers: auth.authHeader,
    });

    await refresh();
  }
  catch (e) {
    console.error('Failed to remove color', e);
  }
};
</script>

<style lang="scss" scoped>
.catalog{
  &_body{
    &-content{
      display: grid;
      max-width: 1440px;
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: auto;
      gap: 20px;
      align-items: start;
      .long{
        grid-column: 2;
        grid-row: span 2;
      }
    }
    &-sizes{
      grid-column: 1;
      grid-row: 2;
    }
  }
  &_categories,
  &_sizes,
  &_colors{
    &-body{
      display: flex;
      flex-direction: column;
      gap: 12px;
      .warning{
        color: $light-brown;
        font-size: 14px;
        text-align: center;
      }
    }
    &-new{
      &__form{
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        .selection{
          width: 200px;
        }
        .btn_submit{
          height: 40px;
          min-width: 40px;
          width: 40px;
          box-sizing: border-box;
        }
        .input_wide{
          margin-bottom: 0;
          &.sku{
            width: 100px;
          }
        }
      }
    }
  }
  &_category,
  &_size,
  &_color{
    display: flex;
    align-items: center;
    gap: 12px;
    .m-icon{
      min-width: 16px;
      cursor: pointer;
    }
  }
  &_categories,
  &_sizes,
  &_colors{
    &-item{
      .input_wide{
        margin-bottom: 0;
        &.sku{
          width: 100px;
        }
      }
    }
  }
}
</style>
