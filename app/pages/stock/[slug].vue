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
              <NuxtLink to="/catalog" class="base_link">{{ t('stock.back_to_catalog') }} » </NuxtLink>
              <NuxtLink :to="{ path: '/catalog', query: { category: stock.category.id } }" class="base_link">
                {{ stock?.category.name }}
              </NuxtLink>
            </div>
            <div class="stock_name">
              {{ stock?.name }}
            </div>
            <div class="stock_price">
              {{ selectedPrice }}
            </div>
            <div v-if="variantGroups.length" class="stock_size">
              <StockSizeSelector v-model="selectedGroup" :title="groupTitle" :options="variantGroups" />
            </div>
            <div class="stock_size">
              <StockSizeSelector v-model="selectedSizeIndex" :options="visibleOffers" />
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

const stockSlug = computed(() => String(route.params.slug ?? ''));

type ProductAttribute = {
  option_id: number;
  attribute: { name: string };
  value: string;
  label?: string | null;
};

type ProductOffer = {
  id: number;
  amount: number | string;
  quantity: number;
  is_active: boolean;
};

type ProductVariant = {
  id: number;
  name: string;
  sku: string;
  attributes: ProductAttribute[];
  offer: ProductOffer;
};

type ProductImage = {
  url: string;
  primary: boolean;
};

type StockItem = {
  id: number;
  name: string;
  description?: string | null;
  category: { id: number; name: string };
  images: ProductImage[];
  variants: ProductVariant[];
};

type ViewOffer = ProductOffer & {
  name: string;
  attributes: ProductAttribute[];
  primary_image: string;
  variant: Record<number, { value: string; name?: string | null }>;
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

const attribute = (variant: ProductVariant | undefined, name: string) => (
  variant?.attributes.find(item => item.attribute.name === name)
);
const attributeValue = (item?: ProductAttribute) => item?.label || item?.value || '';
const productImage = computed(() => (
  data.value?.images.find(image => image.primary)?.url
  || data.value?.images[0]?.url
  || ''
));

const stock = computed(() => {
  const product = data.value;
  if (!product) {
    return {
      name: '',
      description: '',
      category: { id: 0, name: '' },
      images: [] as ProductImage[],
      variants: [] as ProductVariant[],
      options: [{ value: '' }],
      offers: [] as ViewOffer[],
    };
  }

  return {
    ...product,
    options: [{ value: String(product.category.id) }],
    offers: product.variants.map((variant) => {
      const size = attribute(variant, 'Размер');
      return {
        ...variant.offer,
        name: variant.name,
        attributes: variant.attributes,
        primary_image: productImage.value,
        variant: {
          [size?.option_id ?? variant.id]: {
            value: size?.value || variant.name,
            name: size?.label,
          },
        },
      };
    }),
  };
});

const imageSrc = computed(() => productImage.value);

const showLoading = computed(() => pending.value || (!data.value && !error.value));
const showError = computed(() => Boolean(error.value) && !data.value);

const selectedOffer = ref<number | null>(null);
const selectedAmount = ref(1);
const selectedGroup = ref<number | null>(0);
const groupingAttribute = computed(() => {
  const variants = stock.value.variants;
  const names = new Set(variants.flatMap(variant => variant.attributes
    .map(item => item.attribute.name)
    .filter(name => name.toLowerCase() !== 'image_id')));
  if (names.size < 3) return null;
  return variants.some(variant => attribute(variant, 'Фиксация')?.value.trim().toUpperCase() === 'K9')
    ? 'Форма'
    : 'Грани';
});
const groupTitle = computed(() => t(groupingAttribute.value === 'Форма' ? 'stock.form' : 'stock.cuts'));
const variantGroups = computed(() => {
  const name = groupingAttribute.value;
  if (!name) return [];
  const groups = new Map<string, ProductAttribute>();
  for (const variant of stock.value.variants) {
    const item = attribute(variant, name);
    // Keep every variant accessible when the grouping attribute is incomplete.
    if (!item) return [];
    groups.set(item.value, item);
  }
  return [...groups.values()].map(item => ({
    value: item.value,
    variant: { [item.option_id]: { value: item.value, name: item.label } },
  }));
});
const visibleOfferIndexes = computed(() => {
  const group = variantGroups.value[selectedGroup.value ?? 0];
  return stock.value.variants.flatMap((variant, index) => (
    !group || attribute(variant, groupingAttribute.value!)?.value === group.value ? [index] : []
  ));
});
const visibleOffers = computed(() => visibleOfferIndexes.value.map(index => stock.value.offers[index]!));
const selectedSizeIndex = computed({
  get: () => selectedOffer.value === null ? null : visibleOfferIndexes.value.indexOf(selectedOffer.value),
  set: (index: number | null) => {
    selectedOffer.value = index === null ? null : visibleOfferIndexes.value[index] ?? null;
  },
});

watch(
  () => data.value,
  () => {
    selectedGroup.value = 0;
    selectedOffer.value = stock.value.offers.length ? 0 : null;
    selectedAmount.value = 1;
  },
  { immediate: true },
);

watch(visibleOfferIndexes, (indexes) => {
  if (selectedOffer.value === null || !indexes.includes(selectedOffer.value)) {
    selectedOffer.value = indexes[0] ?? null;
    selectedAmount.value = 1;
  }
});

const currentOffer = computed(() => (
  selectedOffer.value === null ? undefined : stock.value.offers[selectedOffer.value]
));
const currentVariant = computed(() => (
  selectedOffer.value === null ? undefined : stock.value.variants[selectedOffer.value]
));

const selectedPrice = computed(() => {
  const amount = currentOffer.value?.amount;
  return amount !== undefined && amount !== null
    ? `${amount} ₽`
    : t('stock.price_placeholder');
});

const selectedMaxQ = computed(() => currentOffer.value?.quantity ?? 0);

const buildAttrs = computed(() => {
  const variant = currentVariant.value ?? stock.value.variants[0];
  const fixation = attribute(variant, 'Фиксация');
  const color = attribute(variant, 'Цвет');
  const secondary = attribute(variant, fixation?.value === 'K9' ? 'Форма' : 'Грани');

  return [
    { name: 'stock.fixation', value: attributeValue(fixation) },
    {
      name: fixation?.value === 'K9' ? 'stock.form' : 'stock.cuts',
      value: attributeValue(secondary),
    },
    { name: 'stock.color', value: attributeValue(color) },
  ].filter(item => item.value);
});

const selectedSize = computed(() => attributeValue(attribute(currentVariant.value, 'Размер')));
const primaryImage = computed(() => productImage.value);

const addToCart = () => {
  const offer = currentOffer.value;
  const variant = currentVariant.value;
  if (!offer || !variant || offer.quantity <= 0) return;

  const color = attributeValue(attribute(variant, 'Цвет'));
  cart.add({
    id: offer.id,
    name: variant.name || stock.value.name,
    properties: [color, selectedSize.value].filter(Boolean),
    price: Number(offer.amount),
    image: primaryImage.value,
    quantity: {
      value: Math.min(selectedAmount.value, offer.quantity),
      max: offer.quantity,
    },
  });
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
