<template>
  <div class="stock_price" :class="{ small }">
    <div class="stock_price-amount" :class="{ old: newPrice || priceDiffer }">
      {{ amount }}
    </div>
    <div v-if="newPrice" class="stock_price-new">
      {{ newPrice || salePrice }}
    </div>
    <div v-if="priceDiffer" class="stock_price-new">
      {{ salePrice }}
    </div>
    ₽
  </div>
</template>

<script lang="ts" setup>
type Discount = {
  uuid: string;
  name: string;
  percent: number;
};

const props = defineProps({
  amount: {
    type: [String, Number],
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
  discounts: {
    type: Array,
    required: false,
  },
  small: {
    type: Boolean,
    default: false,
  },
});

const discT = computed({
  get: () => {
    const dscts = Array.from(props.discounts ?? []);
    console.log(dscts.length);
    return dscts.length >= 1 ? dscts.sort((a: Discount, b: Discount) => Number(b.percent) - Number(a.percent)) : null;
  },
});

const minimalDiscount = computed(() => discT.value === null ? 0 : Number(discT.value[0].percent));
const newPrice = computed(() => {
  if (minimalDiscount.value === 0) return null;
  return Number(props.amount - (props.amount * (minimalDiscount.value / 100))).toFixed(2);
});

const priceDiffer = computed(() => Number(props.amount).toFixed(2) !== Number(props.salePrice).toFixed(2));
</script>

<style lang="scss" scoped>
.stock_price{
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  gap: 5px;
  &.small{
    font-size: 16px;
    margin-bottom: 0;
  }
  &-amount{
    &.old{
      color: $light-brown;
      text-decoration: solid line-through red 2px;
    }
  }
}
</style>
