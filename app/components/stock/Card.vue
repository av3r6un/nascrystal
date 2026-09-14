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
        {{ productCategory }}
      </div>
      <div class="product_name">
        {{ product.name }}
      </div>
      <div class="product_footer">
        <div class="product_price">
          <span v-if="!manyOffers" class="unique">{{ product.min_price }} ₽</span>
          <span v-else>от {{ product.min_price }} ₽</span>
        </div>
        <div class="product_more">
          <NuxtLink :to="`/stock/${product.id}`" class="base_link">
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

type ProductAttribute = {
  attribute: { name: string };
  value: string;
  label?: string | null;
};

const getAttribute = (name: string) => {
  return props.product.variants[0]?.attributes.find((attribute: ProductAttribute) => (
    attribute.attribute.name === name
  ));
};

const attributeName = (attribute?: ProductAttribute) => attribute?.label || attribute?.value || '';
const productCategory = computed(() => {
  const fixation = getAttribute('Фиксация');
  const secondary = getAttribute(fixation?.value === 'K9' ? 'Форма' : 'Грани');
  const primaryName = attributeName(fixation) || props.product.category?.name || '';
  const secondaryName = attributeName(secondary);
  return secondaryName ? `${primaryName} (${secondaryName})` : primaryName;
});

const manyOffers = computed(() => props.product.variants.length > 1);

const getProductImage = computed(() => {
  if (!props.product.images.length) return;
  return props.product.images.find((image: { primary: boolean }) => image.primary)?.url
    || props.product.images[0]?.url;
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
