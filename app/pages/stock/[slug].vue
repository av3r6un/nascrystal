<template>
  <article class="stock">
    <div class="stock_wrapper">
      <div v-if="showLoading" class="stock_state">
        {{ t('default.loading') }}
      </div>
      <div v-else-if="showError" class="stock_state">
        <div class="warning">
          {{ t('stock.warning') }}
        </div>
        {{ error.statusMessage || error.message }}
        <NuxtLink to="/" class="base_link btn btn_submit">
          {{ t('error.go_home') }}
        </NuxtLink>
      </div>
      <div v-else class="stock_body">
        <div class="stock_row media">
          <div class="stock_image">
            <img v-if="imageSrc" :src="imageSrc" alt="primary_image">
            <div v-else class="stock_image-placeholder">
              <Icon name="nsc:diamond" :size="64" />
            </div>
          </div>
          <div class="stock_info">
            <div class="stock_category">
              <NuxtLink :to="`/catalog?0=${stock?.options[0].value}`" class="base_link">
                {{ stockCategory }}
              </NuxtLink>
            </div>
            <div class="stock_name">
              {{ stock?.name }}
            </div>
            <div class="stock_price">
              {{ selectedPrice }}
            </div>
            <div class="stock_size">
              <StockSizeSelector v-model="selectedOffer" :options="stock.offers" />
            </div>
            <div class="stock_quantity">
              <div class="stock_quantity-title">
                {{ t('stock.quantity') }}
              </div>
              <StockQuantity v-model="selectedAmount" :max="selectedMaxQ" />
            </div>
            <button class="btn btn_submit" @click="addToCart">
              {{ t('stock.submit') }}
            </button>
          </div>
        </div>
        <div class="stock_row content">
          <div class="stock_attributes">
            <div class="stock_section-title">
              {{ t('stock.attributes') }}
            </div>
            <div v-for="(item, idx) in buildAttrs" :key="idx" class="stock_attributes-item">
              <div class="stock_attributes-name">
                {{ t(`${item.name}`) }}
              </div>
              <div class="stock_attributes-value">
                {{ item.value }}
              </div>
            </div>
          </div>
          <div class="stock_description">
            <div class="stock_section-title">
              {{ t('stock.description') }}
            </div>
            <div class="stock_description-text">
              <p class="description">
                {{ stock.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'stock_page',
});

const route = useRoute();
const { t } = useI18n();
const cart = useCart();
const isClient = ref(false);

onMounted(() => {
  isClient.value = true;
});

const stockSlug = computed(() => String(route.params.slug ?? ''));

type StockItem = Record<string, unknown> & {
  images?: Array<string>[];
};

const { data, pending, error } = await useAsyncData<StockItem | null>(
  'stock-item',
  () => $fetch<StockItem>(`/internal/stock/${stockSlug.value}`),
  {
    server: false,
    watch: [stockSlug],
    default: () => null,
  },
);

const stock = computed(() => data.value ?? {});

const imageSrc = computed(() => {
  if (!stock.value.images.length) return;
  const image = stock.value.images.find((image: object) => image.is_primary).path;
  if (!image || typeof image !== 'string') return '';
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
    return image;
  }
  return `/img/${image}`;
});

const showLoading = computed(() => {
  if (!isClient.value) return true;
  return pending.value && !data.value;
});

const showError = computed(() => {
  if (!isClient.value) return false;
  return Boolean(error.value) && !data.value;
});

const selectedOffer = ref(null);
const selectedAmount = ref(1);

const selectedPrice = computed(() => {
  const amount = stock.value.offers[selectedOffer.value]?.amount;
  const currency = stock.value.offers[selectedOffer.value]?.currency;
  return amount ? `${amount ?? ''} ${currency ?? ''}` : t('stock.price_placeholder');
});

const selectedMaxQ = computed(() => stock.value.offers[selectedOffer.value]?.quantity);

const stockCategory = computed(() => {
  const name = stock.value?.options[0].name ?? stock.value?.options[0].value ?? '';
  return `${t('stock.category.gems')} ${String(name).toLowerCase()}`;
});

const buildAttrs = computed(() => {
  const fixation = stock.value.options[0].value;
  const attributes = [
    { name: 'stock.fixation', value: stock.value.options[0].value },
  ];
  if (fixation === 'K9') {
    attributes.push(
      { name: 'stock.form', value: stock.value.options[2].value },
      { name: 'stock.color', value: stock.value.options[1].name ?? stock.value.options[1].value },
    );
  }
  else {
    attributes.push(
      { name: 'stock.cuts', value: stock.value.options[1].value },
      { name: 'stock.color', value: stock.value.options[2].name ?? stock.value.options[2].value },
    );
  }
  return attributes;
});

const selectedSize = computed(() => {
  const offer = stock.value.offers[selectedOffer.value]?.variant;
  let size = '';
  Object.entries(offer).forEach(([_, info]) => {
    size = info.name || info.value;
  });
  return size;
});

const addToCart = () => {
  const cartItem = {
    id: stock.value.offers[selectedOffer.value]?.id,
    name: stock.value.offers[selectedOffer.value]?.name,
    properties: [
      stock.value.options[2].name || stock.value.options[2].value,
      selectedSize.value,
    ],
    price: stock.value.offers[selectedOffer.value]?.amount,
    image: stock.value.offers[selectedOffer.value]?.primary_image,
    quantity: {
      value: selectedAmount.value,
      max: selectedMaxQ.value,
    },
  };
  cart.add(cartItem);
};
</script>

<style lang="scss" scoped>
.stock{
  padding: 112px 0;
  color: $brown;
  &_wrapper{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
  }
  &_state{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: $light-brown;
    .warning{
      color: $light-brown;
    }
  }
  &_body{
    display: flex;
    flex-direction: column;
    gap: 64px;
  }
  &_row{
    display: flex;
    gap: 48px;
    width: 100%;
    @media (max-width: 730px) {
      flex-direction: column !important;
      align-items: center;
      gap: 24px;
    }
    &.content{
      flex-direction: row-reverse;
    }
  }
  &_image{
    width: 50%;
    aspect-ratio: 1 / 1;
    min-width: 300px;
    border-radius: 12px;
    background: $light-pink;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    &-placeholder{
      color: $light-brown;
    }
  }
  &_info{
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 50%;
    .btn_submit{
      margin-top: auto;
    }
    @media (max-width: 730px) {
      width: 95%;
      align-items: center;
      .btn_submit{
        width: 315px;
      }
    }
  }
  &_quantity{
    &-title{
      margin-bottom: 12px;
      text-transform: uppercase;
      color: $light-brown;
    }
  }
  &_category,
  &_meta,
  &_description-text,
  &_attributes-empty{
    color: $light-brown;
  }
  &_name{
    font-size: 32px;
    font-weight: 600;
    font-family: $title-font;
  }
  &_price{
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  &_section{
    &-title{
      font-family: $title-font;
      color: $brown;
      font-size: 24px;
      font-weight: 600;
      @media (max-width: 730px) {
        text-align: center;
      }
    }
  }
  &_attributes{
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 50%;
    @media (max-width: 730px) {
      width: 95%;
      min-width: 300px;
    }
    &-item{
      display: flex;
      width: 100%;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid $semi-grey;
    }
    &-name{
      color: $light-brown;
      font-weight: 300;
    }
  }
  &_description{
    width: 50%;
    .description{
      margin-top: 13px;
      white-space: pre-wrap;
    }
  }
  &_attribute{
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 999px;
  }
}
</style>
