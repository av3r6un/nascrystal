<template>
  <article class="catalog" :style="{ '--catalog-header-height': `${headerHeight}px` }">
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
          {{ loadError }}
          <NuxtLink to="/" class="base_link btn_submit big">
            {{ t('error.go_home') }}
          </NuxtLink>
        </div>
        <div v-else class="catalog_body-content">
          <CatalogFilters v-model="filtersQuery" class="catalog_sticky-filters" :filters="allFilters" :show-form="showFormFilter" />
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
const router = useRouter();
const isClient = ref(false);
const currentPageIndex = ref(0);
const previousScrollRestoration = ref<ScrollRestoration | null>(null);
const headerHeight = ref(0);
let headerResizeObserver: ResizeObserver | undefined;

type StockProduct = {
  id: number;
};

type StockResponse = {
  stock: StockProduct[];
  pageIndex: number;
  pageSize: number;
  hasNextPage: boolean;
};

type AttributeOption = {
  value: string;
  label?: string | null;
};

type CatalogAttribute = {
  name: string;
  options: AttributeOption[];
};

type CatalogResponse = {
  categories: Array<{ id: number; name: string; sort_order: number }>;
  attributes: CatalogAttribute[];
};

type CatalogAvailabilityResponse = {
  available: Record<string, string[]>;
  k9CategoryIds: string[];
};

const DISABLED_FILTER_OPTION = Symbol.for('catalog-filter-option-disabled');

const FILTER_NAMES: Record<string, string> = {
  fixation: 'Фиксация',
  cuts: 'Грани',
  size: 'Размер',
  color: 'Цвет',
  form: 'Форма',
};

const normalizeQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string' && item.length > 0)
      .join(',');
  }

  return typeof value === 'string' ? value : '';
};

const legacyFilterKeys: Record<string, string> = {
  0: 'category', 1: 'cuts', 2: 'size', 3: 'color', 4: 'form',
};
const filterRouteKeys = new Set([...Object.keys(legacyFilterKeys), 'category', ...Object.keys(FILTER_NAMES)]);
const readFilterQuery = () => {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(route.query)) {
    const normalizedValue = normalizeQueryValue(value);
    let filterKey = legacyFilterKeys[key] ?? key;
    const legacyZeroValues = normalizedValue.toLowerCase().split(',').filter(Boolean);
    if (key === '0' && legacyZeroValues.length && legacyZeroValues.every(value => ['hot', 'non', 'k9'].includes(value))) {
      filterKey = 'fixation';
    }
    if (filterKey !== 'category' && !Object.hasOwn(FILTER_NAMES, filterKey)) continue;
    if (normalizedValue && (!query[filterKey] || key === filterKey)) query[filterKey] = normalizedValue;
  }
  return query;
};
const filtersQuery = ref<Record<string, string>>(readFilterQuery());
const filterSignature = (filters: Record<string, string>) => JSON.stringify(
  Object.entries(filters).sort(([left], [right]) => left.localeCompare(right)),
);
watch(() => route.query, () => {
  const nextFilters = readFilterQuery();
  if (filterSignature(nextFilters) !== filterSignature(filtersQuery.value)) {
    filtersQuery.value = nextFilters;
    currentPageIndex.value = 0;
  }
});
watch(filtersQuery, (filters) => {
  currentPageIndex.value = 0;
  if (filterSignature(filters) === filterSignature(readFilterQuery())) return;

  const query = Object.fromEntries(
    Object.entries(route.query).filter(([key]) => !filterRouteKeys.has(key)),
  );
  void router.replace({ query: { ...query, ...filters } });
}, { deep: true, flush: 'sync' });
const scrollToPageTop = () => {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
};

onMounted(() => {
  isClient.value = true;
  const header = document.querySelector<HTMLElement>('header.header');
  if (header) {
    const updateHeaderHeight = () => {
      headerHeight.value = header.getBoundingClientRect().bottom;
    };
    updateHeaderHeight();
    headerResizeObserver = new ResizeObserver(updateHeaderHeight);
    headerResizeObserver.observe(header);
  }

  if ('scrollRestoration' in window.history) {
    previousScrollRestoration.value = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
  }

  scrollToPageTop();
});

onBeforeUnmount(() => {
  headerResizeObserver?.disconnect();
  if (previousScrollRestoration.value && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = previousScrollRestoration.value;
  }
});

const requestFilters = computed(() => Object.fromEntries(
  Object.entries(filtersQuery.value).filter(([, value]) => value.trim().length > 0),
));
const stockRequestQuery = computed(() => ({
  page_index: currentPageIndex.value,
  ...requestFilters.value,
}));

const { data: catalogData, pending: catalogPending, error: catalogError } = await useAsyncData(
  'catalog-metadata',
  () => $fetch<CatalogResponse>('/internal/catalog'),
  {
    server: false,
    default: () => null,
  },
);
const { data: stockData, pending: stockPending, error: stockError } = await useAsyncData(
  'catalog-stock',
  () => $fetch<StockResponse>('/internal/stock', { query: stockRequestQuery.value }),
  {
    server: false,
    watch: [stockRequestQuery],
    default: () => null,
  },
);
const { data: availabilityData, pending: availabilityPending, error: availabilityError } = await useAsyncData(
  'catalog-availability',
  () => $fetch<CatalogAvailabilityResponse>('/internal/catalog/availability', { query: requestFilters.value }),
  {
    server: false,
    watch: [requestFilters],
    default: () => null,
  },
);

const showLoading = computed(() => {
  if (!isClient.value) return true;
  return (stockPending.value || catalogPending.value || availabilityPending.value)
    && (!stockData.value || !catalogData.value || !availabilityData.value);
});
const loadError = computed(() => stockError.value || catalogError.value || availabilityError.value);
const showError = computed(() => {
  if (!isClient.value) return false;
  return Boolean(loadError.value) && (!stockData.value || !catalogData.value || !availabilityData.value);
});

const isFilterOptionAvailable = (filterIndex: string, value: string) => {
  const availableValues = availabilityData.value?.available[filterIndex];
  return !availableValues || availableValues.includes(value);
};

const isFilterOptionSelected = (filterIndex: string, value: string) => (
  (filtersQuery.value[filterIndex] ?? '').split(',').includes(value)
);
const filterOption = (filterIndex: string, value: string, label: string) => {
  const option = { [value]: label };
  Object.defineProperty(option, DISABLED_FILTER_OPTION, {
    value: !isFilterOptionAvailable(filterIndex, value),
    enumerable: false,
  });
  return option;
};
const visibleAttributeOptions = (filterIndex: string, options: AttributeOption[]) => (
  options.filter(option => (
    !['size', 'color'].includes(filterIndex)
    || isFilterOptionAvailable(filterIndex, option.value)
    || isFilterOptionSelected(filterIndex, option.value)
  ))
);
const allFilters = computed(() => {
  const catalog = catalogData.value;
  return {
    category: [...(catalog?.categories ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
      .map(category => filterOption('category', String(category.id), category.name)),
    ...Object.fromEntries(Object.entries(FILTER_NAMES).map(([index, name]) => [
      index,
      visibleAttributeOptions(
        index,
        catalog?.attributes.find(attribute => attribute.name === name)?.options ?? [],
      ).map(option => filterOption(index, option.value, option.label || option.value)),
    ])),
  };
});

const selectedCategories = computed(() => (filtersQuery.value.category ?? '').split(',').filter(Boolean));
const showFormFilter = computed(() => {
  const fixations = (filtersQuery.value.fixation ?? '')
    .split(',')
    .map(value => value.trim().toUpperCase());
  if (fixations.includes('K9')) return true;
  const categoryId = selectedCategories.value[0];
  if (!categoryId) return false;
  const category = catalogData.value?.categories.find(item => String(item.id) === categoryId);
  if (!category?.name.toLowerCase().startsWith('пришивные')) return false;
  return availabilityData.value?.k9CategoryIds.includes(categoryId) ?? false;
});

const stockItems = computed(() => stockData.value?.stock ?? []);
const pageIndex = computed(() => stockData.value?.pageIndex ?? currentPageIndex.value);
const hasNextPage = computed(() => stockData.value?.hasNextPage ?? false);

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
  .catalog_sticky-filters{
    position: sticky;
    top: var(--catalog-header-height);
    z-index: 1;
    box-sizing: border-box;
    max-height: calc(100dvh - var(--catalog-header-height));
    overflow-y: auto;
    @media screen and (max-width: 630px) {
      position: relative;
      top: auto;
      z-index: auto;
      max-height: none;
      overflow-y: visible;
    }
  }
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
