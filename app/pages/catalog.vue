<template>
  <article class="catalog">
    <div class="catalog_wrapper">
      <div class="catalog_title base_title a-left">
        {{ t('navbar.catalog') }}
      </div>
      <div class="catalog_body">
        <div v-if="showLoading" class="catalog_state">
          {{ t('default.loading') }}
        </div>
        <div v-else-if="showError" class="catalog_state">
          <div class="warning">
            {{ t('catalog.warning') }}
          </div>
          {{ stockError }}
          <NuxtLink to="/" class="base_link btn_submit big">
            {{ t('error.go_home') }}
          </NuxtLink>
        </div>
        <div v-else class="catalog_body-content">
          <CatalogFilters v-model="filtersQuery" :filters="allFilters" />
          <div class="catalog_body-stock">
            <div class="catalog_grid">
              <div v-for="item in stockItems" :key="item.id" class="catalog_item">
                <StockCard :product="item" />
              </div>
            </div>
            <div v-if="hasNextPage || pageIndex > 0" class="catalog_pages">
              <button type="button" class="btn" :disabled="pageIndex <= 0" @click="prevPage">
                <Icon name="nsc:arrow-left" :size="24" />
              </button>
              <div class="catalog_pages-page">
                {{ pageIndex + 1 }}
              </div>
              <button type="button" class="btn" :disabled="!hasNextPage" @click="nextPage">
                <Icon name="nsc:arrow-right" :size="24" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'catalog',
});

const { t } = useI18n();
const route = useRoute();
const auth = useAuthStore();
const isClient = ref(false);
const currentPageIndex = ref(0);
const previousScrollRestoration = ref<ScrollRestoration | null>(null);

const normalizeQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string' && item.length > 0)
      .join(',');
  }

  return typeof value === 'string' ? value : '';
};

const filtersQuery = ref<Record<string, string>>(
  Object.entries(route.query).reduce<Record<string, string>>((query, [key, value]) => {
    if (key === 'page_index') return query;

    const normalizedValue = normalizeQueryValue(value);
    if (normalizedValue) {
      query[key] = normalizedValue;
    }

    return query;
  }, {}),
);

const stockQuery = computed(() => ({
  ...filtersQuery.value,
  page_index: String(currentPageIndex.value),
}));

const scrollToPageTop = () => {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
};

onMounted(() => {
  isClient.value = true;

  if ('scrollRestoration' in window.history) {
    previousScrollRestoration.value = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
  }

  scrollToPageTop();
});

onBeforeUnmount(() => {
  if (previousScrollRestoration.value && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = previousScrollRestoration.value;
  }
});

const { data: stockData, pending: stockPending, error: stockError } = await useAsyncData(
  'catalog-items',
  () => $fetch('/internal/stock', {
    headers: auth.authHeader,
    query: stockQuery.value, // add currentPage query params to endpoint
  }),
  {
    server: false,
    watch: [stockQuery],
    default: () => null,
  },
);

watch(filtersQuery, () => {
  currentPageIndex.value = 0;
});

const showLoading = computed(() => {
  if (!isClient.value) return true;
  return stockPending.value && !stockData.value;
});
const showError = computed(() => {
  if (!isClient.value) return false;
  return Boolean(stockError.value) && !stockData.value;
});

const allFilters = computed(() => stockData.value?.filters ?? {});
const stockItems = computed(() => Array.isArray(stockData.value?.stock) ? stockData.value.stock : []);
const pageIndex = computed(() => stockData.value?.pageIndex ?? currentPageIndex.value);
const hasNextPage = computed(() => Boolean(stockData.value?.hasNextPage));

const prevPage = () => {
  if (pageIndex.value <= 0) return;
  currentPageIndex.value = pageIndex.value - 1;
  scrollToPageTop();
};

const nextPage = () => {
  if (!hasNextPage.value) return;
  currentPageIndex.value = pageIndex.value + 1;
  scrollToPageTop();
};
</script>

<style lang="scss" scoped>
.catalog{
  padding: 112px 0;
  &_wrapper{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
  }
  &_body{
    margin: 48px 0;
    display: flex;
    align-items: center;
    .warning{
      text-align: center;
      margin-bottom: 19px;
      color: $light-brown;
    }
    .btn_submit.big{
      padding: 0px 14px;
      box-sizing: border-box;
    }
    &-content{
      width: 100%;
      display: flex;
      align-items: flex-start;
      gap: 40px;
      @media (max-width: 630px) {
        flex-direction: column;
        align-items: center;
      }
    }
    &-stock{
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: $light-brown;
      gap: 24px;
    }
  }
  &_grid{
    width: 100%;
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  }
  &_item{
    display: flex;
    justify-content: center;
  }
  &_pages{
    display: flex;
    align-items: center;
    &-page{
      font-size: 15px;
      margin-top: -5px;
    }
    .btn{
      &:disabled{
        cursor: not-allowed;
        opacity: .3;
      }
    }
  }
  &_filters{
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: $light-pink;
    border-radius: 8px;
    min-width: 256px;
    &-title{
      color: $light-brown;
      font-weight: 300;
      user-select: none;
      text-transform: uppercase;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    .btn_add{
      justify-content: center;
    }
  }
}
</style>
