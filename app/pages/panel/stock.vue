<template>
  <article class="stock">
    <div class="stock_title base_title">
      {{ t('panel.stock.title') }}
      <div class="stock_title-btn">
        <button
          type="button"
          class="btn btn_submit"
          :disabled="purgePending"
          @click="purgeProducts"
        >
          {{ $t('panel.stock.purge') }}
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
        <div class="stock_table">
          <div class="stock_table-header">
            <div class="stock_table-th image">
              {{ t('panel.stock.image') }}
            </div>
            <div class="stock_table-th name">
              {{ t('panel.stock.name') }}
            </div>
            <div class="stock_table-th price">
              {{ t('panel.stock.price') }}
            </div>
            <div class="stock_table-th amount">
              {{ t('panel.stock.amount') }}
            </div>
            <div class="stock_table-th category">
              {{ t('panel.stock.category') }}
            </div>
            <div class="stock_table-th status">
              {{ t('panel.stock.status') }}
            </div>
          </div>
          <div class="stock_table-body">
            <div v-for="pr in products" :key="pr.id" class="stock_table-row">
              <div class="stock_table-data image">
                <img v-if="pr.primary_image" :src="`/uploads/${pr.primary_image}`" alt="product_image" class="base_image">
                <div v-else class="image_placeholder">
                  <Icon name="nsc:diamond" :size="16" />
                </div>
              </div>
              <div class="stock_table-data name">
                <NuxtLink :to="`/stock/${pr.id}`" class="base_link">
                  {{ pr.name }}
                  <span class="attributes">{{ nameAttrs(pr.attributes) }}</span>
                </NuxtLink>
                <Icon name="nsc:copy" :size="16" @click="toClipboard(pr.sku)" />
              </div>
              <div class="stock_table-data price">
                {{ pr.offers?.[0].amount }} ₽
              </div>
              <div class="stock_table-data amount">
                {{ pr.offers?.[0].quantity }} {{ pr.offers?.[0].unit }}
              </div>
              <div class="stock_table-data category">
                {{ pr.category.name }}
                <span class="subcategories">
                  {{ subCategories(pr.attributes) }}
                </span>
              </div>
              <div class="stock_table-data status">
                <span v-if="pr.is_active" class="product_status">{{ t('panel.stock.active') }}</span>
                <span v-else class="product_status off">{{ t('panel.stock.not_active') }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="stock_body-pagination">
          <button
            type="button"
            class="btn btn_small"
            :disabled="currentPage <= 1"
            @click="goPrev"
          >
            {{ t('panel.stock.prev_page') }}
          </button>
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
const currentPage = ref(Number(route.query.page) || 1);

const ensureAuthorized = async () => {
  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};

const purgePending = ref(false);

const { data, pending, error, refresh } = await useAsyncData(
  'panel-stock-page',
  async () => {
    await ensureAuthorized();
    const response = await $fetch('/internal/products', {
      headers: auth.authHeader,
      query: {
        page: currentPage.value,
      },
    });
    return response;
  },
  {
    server: false,
    watch: [currentPage],
    default: () => ({
      items: [],
    }),
  },
);

const products = computed(() => data.value?.items);
const hasNextPage = computed(() => data.value?.has_next_page);

const parseAttributes = (attrIds: Array<number>, attrs: Array<object>) => {
  if (!attrs || attrs.length < 1) return [];
  const optionValues = attrs.filter(attr => attrIds.includes(attr.property.id))
    .map(fattr => fattr.option.value);
  return Array.isArray(optionValues) ? optionValues : [];
};

const subCategories = (attributes: Array<object>) => {
  const ids = [1];
  return parseAttributes(ids, attributes).length >= 1 ? `(${parseAttributes(ids, attributes).join(', ')})` : '';
};
const nameAttrs = (attributes: Array<object>) => {
  const ids = [2, 3];
  return parseAttributes(ids, attributes).join(' ');
};
const toClipboard = (val: string) => {
  navigator.clipboard.writeText(val);
};
const purgeProducts = async () => {
  if (purgePending.value) return;

  const confirmed = window.confirm(t('panel.stock.purge_confirm'));
  if (!confirmed) return;

  purgePending.value = true;
  try {
    await ensureAuthorized();
    await $fetch('/internal/products/purge', {
      method: 'POST',
      headers: auth.authHeader,
    });
    await refresh();
    window.alert(t('panel.stock.purge_success'));
  }
  catch (error) {
    console.error('Products purge failed', error);
    window.alert(t('panel.stock.purge_error'));
  }
  finally {
    purgePending.value = false;
  }
};

const goNext = () => currentPage.value += 1;
const goPrev = () => currentPage.value -= 1;
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
      height: 0;
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

      &:not(:last-child){
        border-bottom: 1px solid $pinky;
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
          &:hover{
            text-decoration: underline;
          }
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
  }
  &_body{
    &-pagination{
      display: flex;
      align-items: center;
      justify-content: flex-end;
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
  }
}
</style>
