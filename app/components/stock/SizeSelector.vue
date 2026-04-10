<template>
  <div class="stock_size">
    <div class="stock_size-title">
      {{ t('stock.size') }}
    </div>
    <div class="stock_sizes">
      <div v-for="(offer, idx) in options" :key="idx" class="stock_sizes-item">
        <span v-for="(info, id) in offer.variant" :key="id" :class="{ selected: localValue === idx }" @click="select(idx)">
          {{ info.name ?? info.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: [Number, null],
    required: true,
  },
  options: {
    type: Array<object>,
    required: true,
  },
});
const { t } = useI18n();

const localValue = computed({
  get: () => { return props.modelValue; },
  set: (val) => { emit('update:modelValue', val); },
});

const select = (idx: number) => {
  localValue.value = idx;
  console.log(idx);
};
</script>

<style lang="scss" scoped>
.stock{
  &_size{
    &-title{
      margin-bottom: 12px;
      text-transform: uppercase;
      color: $light-brown;
    }
  }
  &_sizes{
    display: flex;
    gap: 8px;
    &-item{
      cursor: pointer;
      & > span{
        display: block;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 15px;
        color: $light-brown;
        border: 1px solid $semi-grey;
        background: $white;
        transition: all .4s ease;
        &.selected{
          color: $yellow-brown;
          border-color: $yellow-brown;
          background: rgba($yellow-brown, .15);
        }
      }
    }
  }
}
</style>
