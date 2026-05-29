<template>
  <form :id="id" class="form" @submit.prevent="emits('submit')">
    <div class="form_item">
      <CmsElementsInput
        v-model="userName"
        name="cart.form.name"
        type="text"
        required
      />
    </div>
    <div class="form_item">
      <CmsElementsInput
        v-model="userPhone"
        name="cart.form.phone"
        type="text"
        required
        placeholder="+7 (999) 999-99-99"
      />
    </div>
    <div class="form_item">
      <span>{{ t('cart.delivery_way') }}</span>
      <PanelSelection
        v-model="delivery"
        :options="deliveries"
        placeholder="cart.delivery_placeholder"
      />
    </div>
    <div class="form_item">
      <span>{{ t('cart.payment_way') }}</span>
      <PanelSelection
        v-model="payment"
        :options="payments"
        placeholder="cart.payment_placeholder"
      />
    </div>
  </form>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  payments: {
    type: Array<string>,
    required: true,
  },
  deliveries: {
    type: Array<string>,
    required: true,
  },
  id: {
    type: String,
    default: 'infoForm',
  },
});
const emits = defineEmits(['update:modelValue', 'submit']);

const { t } = useI18n();
const userPhone = computed({
  get: () => props.modelValue.phone,
  set: val => emits('update:modelValue', { ...props.modelValue, phone: val }),
});

const userName = computed({
  get: () => props.modelValue.name,
  set: val => emits('update:modelValue', { ...props.modelValue, name: val }),
});

const payment = computed({
  get: () => props.modelValue.payment,
  set: val => emits('update:modelValue', { ...props.modelValue, payment: val }),
});

const delivery = computed({
  get: () => props.modelValue.delivery,
  set: val => emits('update:modelValue', { ...props.modelValue, delivery: val }),
});
</script>

<style lang="scss" scoped>
.form{
  min-width: 380px;
  box-sizing: border-box;
  background: $light-pink;
  border: 1px solid $semi-grey;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @media (max-width: 830px) {
    min-width: auto;
  }
  &-caption{
    margin-top: 24px;
    color: $light-brown;
    font-size: 12px;
    font-weight: 300;
    text-align: center;
  }
  &_item span{
    color: $brown;
    font-size: 16px;
    font-weight: 600;
    display: block;
    margin-bottom: 10px;
  }
}
</style>
