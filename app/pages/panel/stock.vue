<template>
  <article class="stock">
    <div class="stock_title base_title">
      {{ t('panel.stock.title') }}
      <div class="stock_title-btn">
        <button
          type="button"
          class="btn btn_submit"
          :disabled="manualImporting"
          @click="manualImport"
        >
          {{ $t('panel.stock.manual_import') }}
        </button>
      </div>
    </div>
    <div class="stock_body">
      <div v-if="pending" class="stock_state">
        {{ t('loading') }}
      </div>
      <div v-else-if="error" class="stock_state">
        {{ t('panel.stock.load_error') }}
      </div>
      <div v-else class="stock_body-content">
        <div class="stock_controls">
          <input
            v-model="searchQuery"
            type="search"
            class="stock_search"
            :placeholder="t('panel.stock.search_placeholder')"
            :aria-label="t('panel.stock.search_placeholder')"
          >
        </div>
        <div class="stock_table">
          <div class="stock_table-header" role="row">
            <div class="stock_table-th image">
              {{ t('panel.stock.image') }}
            </div>
            <div class="stock_table-th name" role="columnheader" :aria-sort="sortAria('name')">
              <button type="button" class="stock_sort" @click="toggleSort('name')">
                {{ t('panel.stock.name') }}
                <span v-if="sortIndicator('name')" aria-hidden="true">{{ sortIndicator('name') }}</span>
              </button>
            </div>
            <div class="stock_table-th price" role="columnheader" :aria-sort="sortAria('price')">
              <button type="button" class="stock_sort" @click="toggleSort('price')">
                {{ t('panel.stock.price') }}
                <span v-if="sortIndicator('price')" aria-hidden="true">{{ sortIndicator('price') }}</span>
              </button>
            </div>
            <div class="stock_table-th amount" role="columnheader" :aria-sort="sortAria('amount')">
              <button type="button" class="stock_sort" @click="toggleSort('amount')">
                {{ t('panel.stock.amount') }}
                <span v-if="sortIndicator('amount')" aria-hidden="true">{{ sortIndicator('amount') }}</span>
              </button>
            </div>
            <div class="stock_table-th category" role="columnheader" :aria-sort="sortAria('category')">
              <button type="button" class="stock_sort" @click="toggleSort('category')">
                {{ t('panel.stock.category') }}
                <span v-if="sortIndicator('category')" aria-hidden="true">{{ sortIndicator('category') }}</span>
              </button>
            </div>
            <div class="stock_table-th status" role="columnheader" :aria-sort="sortAria('status')">
              <button type="button" class="stock_sort" @click="toggleSort('status')">
                {{ t('panel.stock.status') }}
                <span v-if="sortIndicator('status')" aria-hidden="true">{{ sortIndicator('status') }}</span>
              </button>
            </div>
          </div>
          <div class="stock_table-body">
            <div v-if="!paginatedProducts.length" class="stock_empty">
              {{ t('panel.stock.no_results') }}
            </div>
            <div v-for="pr in paginatedProducts" :key="pr.id" class="stock_table-row" @click="toggleProduct(pr.id)">
              <div class="stock_table-data image">
                <img v-if="primaryImage(pr.images)" :src="primaryImage(pr.images)" alt="product_image" class="base_image">
                <div v-else class="image_placeholder">
                  <Icon name="nsc:diamond" :size="16" />
                </div>
              </div>
              <div class="stock_table-data name">
                <NuxtLink :to="`/stock/${pr.id}`" class="base_link" @click.stop>
                  {{ pr.name }}
                </NuxtLink>
                <Icon name="nsc:copy" :size="16" @click.stop="toClipboard(pr.sku)" />
              </div>
              <div class="stock_table-data price">
                —
              </div>
              <div class="stock_table-data amount">
                {{ pr.variants.length }} ({{ pr.variants_count }})
              </div>
              <div class="stock_table-data category">
                {{ pr.category.name }}
              </div>
              <div class="stock_table-data status">
                <span v-if="!pr.archived" class="product_status">{{ t('panel.stock.active') }}</span>
                <span v-else class="product_status off">{{ t('panel.stock.not_active') }}</span>
              </div>
              <div v-if="isProductExpanded(pr.id)" class="stock_table-variants" @click.stop>
                <div v-for="v in pr.variants" :key="v.id" class="stock_table-variant-row">
                  <div class="stock_table-data image tree" />
                  <div class="stock_table-data name">
                    <span :title="v.sku">{{ v.name }}</span>
                    <Icon name="nsc:copy" :size="16" @click="toClipboard(v.sku)" />
                  </div>
                  <div class="stock_table-data price">
                    {{ v.offer?.amount ?? '—' }} <span v-if="v.offer"> ₽</span>
                  </div>
                  <div class="stock_table-data amount">
                    {{ v.offer?.quantity ?? '—' }}
                  </div>
                  <div class="stock_table-data category">
                    {{ variantAttributes(v.attributes) || '—' }}
                  </div>
                  <div class="stock_table-data status">
                    <span v-if="!v.archived && v.offer?.is_active" class="product_status">{{ t('panel.stock.active') }}</span>
                    <span v-else class="product_status off">{{ t('panel.stock.not_active') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="filteredAndSortedProducts.length" class="stock_body-pagination">
          <button
            type="button"
            class="btn btn_small"
            :disabled="currentPage <= 1"
            @click="goPrev"
          >
            {{ t('panel.stock.prev_page') }}
          </button>
          <span class="stock_body-page">
            {{ t('panel.stock.page_status', { current: currentPage, total: totalPages }) }}
          </span>
          <button
            type="button"
            class="btn btn_small"
            :disabled="!hasNextPage"
            @click="goNext"
          >
            {{ t('panel.stock.next_page') }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'stock',
  layout: 'panel',
});

const { t } = useI18n();
const auth = useAuthStore();
const route = useRoute();
const routePage = Number(route.query.page);
const currentPage = ref(Number.isInteger(routePage) && routePage > 0 ? routePage : 1);
const searchQuery = ref('');

type SortKey = 'name' | 'price' | 'amount' | 'category' | 'status';
type SortDirection = 'asc' | 'desc';

type ProductAttribute = {
  value: string;
  label?: string | null;
};

type ProductOffer = {
  amount: number | string;
  quantity: number;
  is_active: boolean;
};

type ProductVariant = {
  id: number;
  name: string;
  sku: string;
  archived: boolean;
  attributes: ProductAttribute[];
  offer?: ProductOffer | null;
};

type StockProduct = {
  id: number;
  name: string;
  sku?: string | null;
  archived: boolean;
  category: { name: string };
  images: Array<{ url: string; primary: boolean }>;
  variants: ProductVariant[];
  variants_count: number;
};

type ProductsResponse = {
  items: StockProduct[];
  page_size?: number;
};

const sortKey = ref<SortKey | null>(null);
const sortDirection = ref<SortDirection | null>(null);

const ensureAuthorized = async () => {
  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};

const manualImporting = ref(false);

type ManualImportResponse = {
  products: number;
  variants: number;
  skipped_products: Array<{ id: string; name: string }>;
};

const { data, pending, error, refresh } = await useAsyncData(
  'panel-stock-page',
  async () => {
    await ensureAuthorized();
    const response = await $fetch<ProductsResponse>('/internal/products', {
      headers: auth.authHeader,
      query: {
        all: true,
      },
    });
    return response;
  },
  {
    server: false,
    default: () => ({
      items: [],
      page_size: 20,
    }),
  },
);

const allProducts = computed(() => data.value?.items ?? []);
const pageSize = computed(() => {
  const value = Number(data.value?.page_size);
  return Number.isInteger(value) && value > 0 ? value : 20;
});
const expandedProducts = ref<Set<number>>(new Set());

const normalizeSearchValue = (value: unknown) => String(value ?? '')
  .toLocaleLowerCase()
  .replace(/\s+/g, ' ')
  .trim();
const productSearchIndex = computed(() => new Map(
  allProducts.value.map(product => [
    product.id,
    normalizeSearchValue([
      product.name,
      product.sku,
      ...product.variants.flatMap(variant => [
        variant.name,
        variant.sku,
        ...variant.attributes.flatMap(attribute => [attribute.label, attribute.value]),
      ]),
    ].join(' ')),
  ]),
));

const productMinPrice = (product: StockProduct) => {
  const prices = product.variants
    .map(variant => Number(variant.offer?.amount))
    .filter(price => Number.isFinite(price));
  return prices.length ? Math.min(...prices) : null;
};

const sortValue = (product: StockProduct, key: SortKey): string | number | null => {
  if (key === 'name') return product.name;
  if (key === 'price') return productMinPrice(product);
  if (key === 'amount') return product.variants_count;
  if (key === 'category') return product.category?.name ?? '';
  return product.archived ? 1 : 0;
};

const compareProducts = (left: StockProduct, right: StockProduct, key: SortKey) => {
  const leftValue = sortValue(left, key);
  const rightValue = sortValue(right, key);
  if (leftValue === null) return rightValue === null ? 0 : 1;
  if (rightValue === null) return -1;
  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return leftValue - rightValue;
  }
  return String(leftValue).localeCompare(String(rightValue), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

const filteredAndSortedProducts = computed(() => {
  const searchTerms = normalizeSearchValue(searchQuery.value).split(' ').filter(Boolean);
  const filtered = searchTerms.length
    ? allProducts.value.filter((product) => {
        const searchIndex = productSearchIndex.value.get(product.id) ?? '';
        return searchTerms.every(term => searchIndex.includes(term));
      })
    : allProducts.value;

  if (!sortKey.value || !sortDirection.value) return filtered;
  const direction = sortDirection.value === 'asc' ? 1 : -1;
  return filtered
    .map((product, index) => ({ product, index }))
    .sort((left, right) => (
      compareProducts(left.product, right.product, sortKey.value!) * direction
      || left.index - right.index
    ))
    .map(item => item.product);
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAndSortedProducts.value.length / pageSize.value)));
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredAndSortedProducts.value.slice(start, start + pageSize.value);
});
const hasNextPage = computed(() => currentPage.value < totalPages.value);

watch([searchQuery, sortKey, sortDirection], () => {
  currentPage.value = 1;
});
watch([totalPages, pending], ([pages, isPending]) => {
  if (!isPending && currentPage.value > pages) currentPage.value = pages;
}, { immediate: true });

const primaryImage = (images: Array<{ url: string; primary: boolean }> = []) => {
  return images.find(image => image.primary)?.url;
};
const variantAttributes = (attributes: ProductAttribute[] = []) => {
  return attributes.map(attribute => attribute.label || attribute.value).join(', ');
};
const toClipboard = (val?: string | null) => {
  if (val) navigator.clipboard.writeText(val);
};
const isProductExpanded = (productId: number) => expandedProducts.value.has(productId);
const toggleProduct = (productId: number) => {
  const expanded = new Set(expandedProducts.value);
  if (expanded.has(productId)) expanded.delete(productId);
  else expanded.add(productId);
  expandedProducts.value = expanded;
};
const toggleSort = (key: SortKey) => {
  if (sortKey.value !== key) {
    sortKey.value = key;
    sortDirection.value = 'asc';
    return;
  }
  if (sortDirection.value === 'asc') {
    sortDirection.value = 'desc';
    return;
  }
  sortKey.value = null;
  sortDirection.value = null;
};
const sortIndicator = (key: SortKey) => {
  if (sortKey.value !== key) return '';
  return sortDirection.value === 'asc' ? '↑' : '↓';
};
const sortAria = (key: SortKey): 'ascending' | 'descending' | 'none' => {
  if (sortKey.value !== key) return 'none';
  return sortDirection.value === 'asc' ? 'ascending' : 'descending';
};
const manualImport = async () => {
  if (manualImporting.value) return;

  const confirmed = window.confirm(t('panel.stock.manual_confirm'));
  if (!confirmed) return;

  manualImporting.value = true;
  try {
    await ensureAuthorized();
    const result = await $fetch<ManualImportResponse>('/internal/products/import', {
      method: 'GET',
      headers: auth.authHeader,
      retry: 0,
    });
    await refresh();
    const skipped = result.skipped_products.map(product => product.name);
    window.alert([
      t('panel.stock.import_success'),
      skipped.length ? `${t('panel.stock.skipped_products')}: ${skipped.join(', ')}` : '',
    ].filter(Boolean).join('\n'));
  }
  catch (error) {
    console.error('Products import failed', error);
    window.alert(t('panel.stock.import_error'));
  }
  finally {
    manualImporting.value = false;
  }
};

const goNext = () => {
  if (hasNextPage.value) currentPage.value += 1;
};
const goPrev = () => {
  if (currentPage.value > 1) currentPage.value -= 1;
};
</script>

<style lang="scss" scoped>
.stock{
  .stock_image{
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }
  &_body{
    &-content{
      max-width: 1440px;
    }
  }
  &_controls{
    display: flex;
    margin-bottom: 12px;
  }
  &_search{
    width: min(100%, 520px);
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid $semi-grey;
    border-radius: 10px;
    background: $white;
    color: $brown;
    font: inherit;
    outline: none;
    &::placeholder{
      color: $light-brown;
    }
    &:focus{
      border-color: $yellow-brown;
    }
  }
  &_sort{
    display: inline-flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    .status &{
      justify-content: center;
    }
  }
  &_empty{
    padding: 28px 16px;
    color: $light-brown;
    text-align: center;
  }
  &_table{
    --stock-column-image: 80px;
    --stock-column-name: minmax(220px, 2fr);
    --stock-column-price: minmax(96px, 0.7fr);
    --stock-column-amount: minmax(96px, 0.7fr);
    --stock-column-category: minmax(300px, 1fr);
    --stock-column-status: minmax(130px, 0.8fr);
    --stock-columns:
      var(--stock-column-image)
      var(--stock-column-name)
      var(--stock-column-price)
      var(--stock-column-amount)
      var(--stock-column-category)
      var(--stock-column-status);
    @media (max-width: 1200px) {
      --stock-columns:
        var(--stock-column-image)
        var(--stock-column-name)
        var(--stock-column-price)
        var(--stock-column-amount)
        var(--stock-column-category);
    }
    background: $light-pink;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid $semi-grey;
    border-radius: 12px;
    width: 100%;
    overflow-x: auto;
    user-select: none;
    &::-webkit-scrollbar{
      -webkit-appearance: none;
      height: 4px;
    }
    &::-webkit-scrollbar-thumb{
      background: $semi-grey;
      border-radius: 4px;
    }
    &-header{
      display: grid;
      grid-template-columns: var(--stock-columns);
      min-height: 40px;
      align-items: center;
      border-bottom: .8px solid $semi-grey;
      color: $light-brown;
    }
    &-th{
      padding: 0 12px;
      min-width: 0;
      font-weight: 600;
      &:last-child{
        text-align: center;
      }
      &.status{
        @media (max-width: 1200px) {
          display: none;
        }
      }
    }
    &-body{
      display: flex;
      flex-direction: column;
    }
    &-row{
      display: grid;
      grid-template-columns: var(--stock-columns);
      align-items: center;
      min-height: 72px;
      cursor: pointer;

      > .stock_table-data{
        display: flex;
        align-items: center;
        min-height: 72px;
        &.status{
          justify-content: center;
        }
      }

      &:not(:last-child){
        border-bottom: 1px solid $pinky;
      }
    }
    &-variants{
      grid-column: 1 / -1;
      min-width: 0;
      background: $light-pink;
      border-top: 1px solid $pinky;
      max-height: 320px;
      overflow-y: auto;
    }
    &-variant-row{
      display: grid;
      grid-template-columns: var(--stock-columns);
      align-items: center;
      min-height: 52px;
      &:not(:last-child){
        border-bottom: 1px solid $pinky;
      }
      &:last-child{
        .stock_table-data.image.tree{
          &:before{
            bottom: 0;
            height: 12.5px;
          }
        }
      }
    }
    &-data{
      padding: 0 12px;
      min-width: 0;
      overflow-wrap: anywhere;
      white-space: nowrap;
      color: $brown;
      &.image{
        display: flex;
        align-items: center;
        justify-content: center;
        .base_image{
          width: 40px;
          height: 40px;
          border-radius: 8px;
        }
        &.tree{
          position: relative;
          &:before,&:after{
            position: absolute;
            content: '';
            border: 1px solid;
            border-color: $yellow-brown;
            width: 25px;
            right: 0;
            left: calc(50% - 2px);
          }
          &:before{
            height: 20px;
            width: 0;
          }
        }
      }
      &.name{
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 5px;
        container-type: inline-size;
        @container (max-width: 220px){
          .attributes { display: none; }
        }
        .m-icon{
          min-width: 16px;
          margin-left: auto;
          cursor: pointer;
        }
        .base_link{
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          &:hover{
            text-decoration: underline;
          }
        }
        span{
          max-width: calc(100% - 10px);
          display: block;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
      &.category{
        color: $light-brown;
      }
      &.status{
        text-align: center;
        @media (max-width: 1200px) {
          display: none;
        }
        .product_status{
          padding: 2px 12px;
          border-radius: 20px;
          font-weight: 600;
          background: $brown;
          color: $white;
          &.off{
            color: $brown;
            background: $semi-grey;
          }
        }
      }
    }
  }
  &_title{
    position: relative;
    &-btn{
      position: absolute;
      right: 0;
      top: calc(50% - 24px);
      .btn_submit{
        padding: 0 7px;
      }
    }
    @media (max-width: 600px) {
      padding-bottom: 56px;
      &-btn{
        top: auto;
        right: auto;
        bottom: 0;
        left: 0;
      }
    }
  }
  &_body{
    &-pagination{
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
      .btn_small{
        color: $brown;
        font-family: $text-font;
        &:disabled{
          color: $light-brown;
          cursor: not-allowed;
        }
      }
    }
    &-page{
      color: $light-brown;
      font-size: 14px;
    }
  }
}
</style>
