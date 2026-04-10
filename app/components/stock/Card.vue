<template>
  <div class="product">
    <div class="product_image">
      <img v-if="getProductImage" :src="getProductImage" alt="product_image" class="base_image">
      <div v-else class="product_image-placehoolder">
        <Icon name="nsc:diamond" :size="24" />
      </div>
    </div>
    <div class="product_info">
      <div class="product_category">
        {{ getProductCategory(product.options) }}
      </div>
      <div class="product_name">
        {{ product.name }}
      </div>
      <div class="product_footer">
        <div class="product_price">
          <span v-if="!manyOffers" class="unique">{{ getPrice(product.offers) }} ₽</span>
          <span v-else>от {{ getPrice(product.offers) }} ₽</span>
        </div>
        <div class="product_more">
          <NuxtLink :to="`/stock/${product.offers[0].id}`" class="base_link">
            {{ t('default.more') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();

const getPrice = (offers: Array<object>) => {
  const amounts = offers
    .map(offer => Number(offer?.amount))
    .filter(amount => !Number.isNaN(amount));

  return amounts.length ? Math.min(...amounts) : 0;
};

const getProductCategory = (options: Array<object>) => {
  const primary = options[0].name ?? options[0].value;
  let secondary = options[1].name ?? options[1].value;
  if (options[0].value === 'K9') {
    secondary = options[2].name ?? options[2].value;
  }
  return `${primary} (${secondary})`;
};

const manyOffers = computed(() => props.product.offers.length > 1);

const getProductImage = computed(() => {
  if (!props.product.images.length) return;
  const image = props.product.images.find((image: object) => image.is_primary).path;
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return `/img/${image}`;
});
</script>

<style lang="scss" scoped>
.product{
  border-radius: 8px;
  background: $light-pink;
  &_image{
    width: 290px;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    aspect-ratio: 3 / 2;
    background: #E7E1DA;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &_info{
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    color: $light-brown;
    font-weight: 300;
  }
  &_name{
    color: $brown;
    font-weight: 500;
  }
  &_footer{
    display: flex;
    align-items: center;
    justify-content: space-between;
    .base_link{
      color: $yellow-brown;
      text-decoration: underline;

    }
  }
}
</style>
