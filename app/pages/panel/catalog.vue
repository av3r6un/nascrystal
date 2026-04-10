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
        <PanelPropertyEditor
          v-for="pr in properties"
          :id="pr.id"
          :key="pr?.id"
          v-model="options"
          :name="pr.name"
          @submit="justUpdate"
        />
        <!-- <div class="catalog_body-sizes panel_section">
          <div class="catalog_sizes-title">
            {{ t('panel.catalog.sizes') }}
          </div>
          <div v-if="sizes.length >= 1" class="catalog_sizes-body">
            <div v-for="size in sizes" :key="size.id" class="catalog_sizes-item">
              <div class="catalog_size">
                <span class="option_name">{{ size.value }}</span>
                <input
                  v-model="size.name"
                  class="input_wide"
                  :placeholder="t('panel.catalog.name')"
                  type="text"
                >
              </div>
            </div>
          </div>
          <div v-else class="catalog_sizes-body">
            <p class="warning">
              {{ t('panel.catalog.sizes_empty') }}
            </p>
          </div>
          <div class="catalog_sizes-submit">
            <button type="button" class="btn btn_submit" :disabled="pending || isUpdatingSizes || !sizesDirty" @click="updateSizes">
              {{ t('panel.catalog.submit') }}
            </button>
          </div>
        </div>
        <div class="catalog_body-colors panel_section">
          <div class="catalog_colors-title">
            {{ t('panel.catalog.colors') }}
          </div>
          <div v-if="colors.length >= 1" class="catalog_colors-body">
            <div v-for="color in colors" :key="color.id" class="catalog_colors-item">
              <div class="catalog_color">
                <span class="option_name">{{ color.value }}</span>
                <input
                  v-model="color.name"
                  class="input_wide"
                  :placeholder="t('panel.catalog.name')"
                  type="text"
                >
              </div>
            </div>
          </div>
          <div v-else class="catalog_colors-body">
            <p class="warning">
              {{ t('panel.catalog.colors_empty') }}
            </p>
          </div>
          <div class="catalog_colors-submit">
            <button type="button" class="btn btn_submit" :disabled="pending || isUpdatingColors || !colorsDirty" @click="updateColors">
              {{ t('panel.catalog.submit') }}
            </button>
          </div>
        </div> -->
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

// const stringifyItems = (items: unknown) => JSON.stringify(items ?? []);
// const cloneItems = (items: unknown) => JSON.parse(JSON.stringify(Array.isArray(items) ? items : []));
// const stringifyOptionItems = (items: { id?: number | string; name?: string }[]) => stringifyItems(items.map(item => ({
//   id: item.id,
//   name: item.name ?? '',
// })));

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
    const propertiesResponse = await $fetch('/internal/catalog', {
      headers: auth.authHeader,
    });

    return propertiesResponse;
  },
  {
    server: false,
    default: () => ({
      properties: [],
      options: [],
    }),
  },
);

const properties = computed(() => data.value?.properties);
const options = computed({
  get: () => { return data.value?.options; },
  set: (val) => { justUpdate(val); },
});

const justUpdate = async (newVal: Array<object>) => {
  try {
    await ensureAuthorized();
    const resp = await $fetch('/internal/catalog/options', {
      method: 'PATCH',
      body: { items: newVal.map(item => ({ id: item.id, icon: item.icon, name: item.name })) },
      headers: auth.authHeader,
    });
    if (resp?.status === 'success') await refresh();
  }
  catch (e) {
    console.error('Failed to update sizes', e);
  }
};
</script>

<style lang="scss" scoped>
.catalog{
  &_body{
    &-content{
      max-width: 1440px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: auto;
      gap: 20px;
      align-items: start;
      @media screen {
        @media (max-width: 1153px) {
          grid-template-columns: 1fr;
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
