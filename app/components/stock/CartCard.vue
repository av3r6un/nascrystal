<template>
  <div class="card">
    <div class="card_image">
      <img v-if="imageSrc" :src="imageSrc" :alt="`${id}_image`">
      <div v-else class="card_image__placeholder">
        <Icon name="nsc:diamond" :size="32" />
      </div>
    </div>
    <div class="card_info">
      <div class="card_name">
        {{ name }}
      </div>
      <div class="card_properties">
        <span v-for="(p, idx) in properties" :key="idx" class="card_property">
          {{ p }}
          <span v-if="idx < properties.length - 1">· </span>
        </span>
      </div>
      <div class="card_price">
        {{ price }} ₽
      </div>
    </div>
    <div class="card_actions">
      <div class="card_actions-delete" @click="emits('remove', id)">
        <Icon name="nsc:trash" :size="16" />
      </div>
      <div class="card_quantity">
        <StockQuantity v-model="quant" :max="10" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  name: {
    type: String,
  },
  properties: {
    type: Array,
    default: () => ([]),
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Object,
    default: () => ({ value: 1, max: 1 }),
  },
});
const emits = defineEmits(['remove', 'quantChanged']);

const imageSrc = computed(() => {
  if (!props.image || typeof props.image !== 'string') return '';
  if (props.image.startsWith('http://') || props.image.startsWith('https://') || props.image.startsWith('/')) {
    return props.image;
  }
  return `/img/${props.image}`;
});

const quant = computed({
  get: () => props.quantity.value,
  set: val => emits('quantChanged', props.id, val),
});
</script>

<style lang="scss" scoped>
.card{
  border-radius: 8px;
  background: $light-pink;
  border: 1px solid $semi-grey;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  @media (max-width: 450px) {
    gap: 8px;
  }
  &_image{
    aspect-ratio: 1 / 1;
    width: 80px;
    border-radius: 8px;
    background: #E7E1DA;
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
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  &_property{
    font-size: 12px;
    color: $light-brown;
  }
  &_price{
    margin-top: auto;
    color: $brown;
    font-weight: 700;
  }
  &_name{
    font-family: $title-font;
    color: $brown;
    font-size: 20px;
    font-weight: 600;
  }
  &_actions{
    margin-left: auto;
    &-delete{
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
    }
    margin-top: auto;
    .quantity{
      margin-bottom: 0;
    }
  }
}
</style>
