<template>
  <article class="catalog">
    <div class="catalog_title base_title">
      {{ t('panel.catalog.title') }}
    </div>
    <div class="catalog_body">
      <div v-if="pending" class="catalog_state">
        {{ t('loading') }}
      </div>
      <div v-else-if="error" class="catalog_state">
        {{ t('panel.catalog.load_error') }}
      </div>
      <div v-else class="catalog_body-content">
        <PanelCategoryOrder :categories="data.categories" @saved="data.categories = $event" />
        <PanelPropertyEditor
          v-for="attribute in attributes"
          :id="attribute.id"
          :key="attribute.id"
          v-model="options"
          :name="attribute.name"
          @submit="justUpdate"
        />
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'catalog',
  layout: 'panel',
});
const { t } = useI18n();
const auth = useAuthStore();

type AttributeOption = {
  id: number;
  attribute_id: number;
  value: string;
  label: string | null;
};

type CatalogAttribute = {
  id: number;
  name: string;
  options: AttributeOption[];
};

type CatalogResponse = {
  attributes: CatalogAttribute[];
  categories: Array<{ id: number; name: string; sort_order: number }>;
};

const ensureAuthorized = async () => {
  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};

const { data, pending, error, refresh } = await useAsyncData(
  'panel-catalog-page',
  async () => {
    await ensureAuthorized();
    const propertiesResponse = await $fetch<CatalogResponse>('/internal/catalog', {
      headers: auth.authHeader,
    });

    return propertiesResponse;
  },
  {
    server: false,
    default: () => ({
      attributes: [],
      categories: [],
    }),
  },
);

const attributes = computed(() => data.value?.attributes ?? []);
const options = computed(() => attributes.value.flatMap(attribute => attribute.options));

const justUpdate = async (newVal: AttributeOption[]) => {
  try {
    await ensureAuthorized();
    const resp = await $fetch('/internal/catalog/options', {
      method: 'PATCH',
      body: { items: newVal.map(item => ({ id: item.id, label: item.label })) },
      headers: auth.authHeader,
    });
    if (resp?.status === 'success') await refresh();
  }
  catch (e) {
    console.error('Failed to update attributes', e);
  }
};
</script>

<style lang="scss" scoped>
.catalog{
  &_body{
    &-content{
      max-width: 1440px;
      column-count: 2;
      column-gap: 20px;
      > :deep(.panel_section){
        break-inside: avoid;
        margin-bottom: 20px;
      }
      @media screen {
        @media (max-width: 1153px) {
          column-count: 1;
        }
      }
    }
  }
  &_sizes,
  &_colors{
    &-body{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
  &_size,
  &_color{
    display: flex;
    align-items: center;
    gap: 12px;
    .option_name{
      width: 120px;
    }
    .input_wide{
      margin-bottom: 0;
    }
  }
}
</style>
