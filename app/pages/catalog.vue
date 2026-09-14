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
          {{ stockError }}
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
const isClient = ref(false);
const currentPageIndex = ref(0);
const previousScrollRestoration = ref<ScrollRestoration | null>(null);
const headerHeight = ref(0);
let headerResizeObserver: ResizeObserver | undefined;

type ProductAttribute = {
  attribute: { name: string };
  value: string;
  label?: string | null;
};

type ProductVariant = {
  id: number;
  attributes: ProductAttribute[];
  offer: { amount: number | string };
};

type StockProduct = {
  id: number;
  category: { id: number };
  variants: ProductVariant[];
  min_price: number | string;
};

type StockResponse = {
  stock: StockProduct[];
  pageSize: number;
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
const readFilterQuery = () => {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(route.query)) {
    const normalizedValue = normalizeQueryValue(value);
    let filterKey = legacyFilterKeys[key] ?? key;
    if (key === '0' && ['hot', 'non', 'k9'].includes(normalizedValue.toLowerCase())) {
      filterKey = 'fixation';
    }
    if (filterKey !== 'category' && !Object.hasOwn(FILTER_NAMES, filterKey)) continue;
    if (normalizedValue && (!query[filterKey] || key === filterKey)) query[filterKey] = normalizedValue;
  }
  return query;
};
const filtersQuery = ref<Record<string, string>>(readFilterQuery());
watch(() => route.query, () => {
  filtersQuery.value = readFilterQuery();
});
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

const { data: catalogData, pending: stockPending, error: stockError } = await useAsyncData(
  'catalog-items',
  async () => {
    const [stock, catalog] = await Promise.all([
      $fetch<StockResponse>('/internal/stock', { query: { all: true } }),
      $fetch<CatalogResponse>('/internal/catalog'),
    ]);
    return { stock, catalog };
  },
  {
    server: false,
    default: () => null,
  },
);

watch(filtersQuery, () => {
  currentPageIndex.value = 0;
});

const showLoading = computed(() => {
  if (!isClient.value) return true;
  return stockPending.value && !catalogData.value;
});
const showError = computed(() => {
  if (!isClient.value) return false;
  return Boolean(stockError.value) && !catalogData.value;
});

const variantMatchesFilters = (variant: ProductVariant, excludedFilterIndex?: string) => {
  const excludedFilterIndexes = new Set([excludedFilterIndex]);
  if (excludedFilterIndex === 'category') {
    excludedFilterIndexes.add('cuts');
    excludedFilterIndexes.add('form');
  }

  return selectedAttributes.value
    .filter(filter => !excludedFilterIndexes.has(filter.index))
    .every(filter => variant.attributes.some(attribute => (
      attribute.attribute.name === filter.name && filter.values.includes(filter.name === 'Фиксация' ? attribute.value.toLowerCase() : attribute.value)
    )));
};

const isFilterOptionAvailable = (filterIndex: string, value: string) => {
  const products = catalogData.value?.stock.stock ?? [];

  return products.some((product) => {
    if (filterIndex === 'category') {
      if (String(product.category.id) !== value) return false;
    }
    else if (
      selectedCategories.value.length
      && !selectedCategories.value.includes(String(product.category.id))
    ) {
      return false;
    }

    return product.variants.some(variant => (
      variantMatchesFilters(variant, filterIndex)
      && (
        filterIndex === 'category'
        || variant.attributes.some(attribute => (
          attribute.attribute.name === FILTER_NAMES[filterIndex]
          && attribute.value === value
        ))
      )
    ));
  });
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
  const catalog = catalogData.value?.catalog;
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
  if (filtersQuery.value.fixation?.toUpperCase() === 'K9') return true;
  const categoryId = selectedCategories.value[0];
  const category = catalogData.value?.catalog.categories.find(item => String(item.id) === categoryId);
  if (!category?.name.toLowerCase().startsWith('пришивные')) return false;

  return (catalogData.value?.stock.stock ?? []).some(product => (
    String(product.category.id) === categoryId
    && product.variants.some(variant => variant.attributes.some(attribute => (
      attribute.attribute.name === 'Фиксация' && attribute.value.toUpperCase() === 'K9'
    )))
  ));
});
const selectedAttributes = computed(() => Object.entries(filtersQuery.value)
  .filter(([index]) => index !== 'category')
  .map(([index, value]) => ({
    index,
    name: FILTER_NAMES[index],
    values: value.split(',').map(item => index === 'fixation' ? item.trim().toLowerCase() : item.trim()).filter(Boolean),
  }))
  .filter(filter => filter.name && filter.values.length));

const filteredProducts = computed(() => {
  const products = catalogData.value?.stock.stock ?? [];
  if (!selectedCategories.value.length && !selectedAttributes.value.length) return products;

  return products.flatMap((product) => {
    if (selectedCategories.value.length && !selectedCategories.value.includes(String(product.category.id))) return [];

    const variants = product.variants.filter(variant => selectedAttributes.value.every(filter => (
      variant.attributes.some(attribute => (
        attribute.attribute.name === filter.name && filter.values.includes(filter.name === 'Фиксация' ? attribute.value.toLowerCase() : attribute.value)
      ))
    )));
    if (!variants.length) return [];

    const minPrice = Math.min(...variants.map(variant => Number(variant.offer.amount)));
    return [{
      ...product,
      variants,
      min_price: Number.isFinite(minPrice) ? minPrice.toFixed(2) : product.min_price,
    }];
  });
});

const pageSize = computed(() => {
  const value = Number(catalogData.value?.stock.pageSize);
  return Number.isInteger(value) && value > 0 ? value : 20;
});
const stockItems = computed(() => {
  const start = currentPageIndex.value * pageSize.value;
  return filteredProducts.value.slice(start, start + pageSize.value);
});
const pageIndex = computed(() => currentPageIndex.value);
const hasNextPage = computed(() => (
  (currentPageIndex.value + 1) * pageSize.value < filteredProducts.value.length
));

watch(filteredProducts, (products) => {
  const lastPage = Math.max(0, Math.ceil(products.length / pageSize.value) - 1);
  if (currentPageIndex.value > lastPage) currentPageIndex.value = lastPage;
});

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
