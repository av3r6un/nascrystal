<template>
  <article class="cart">
    <div class="cart_wrapper">
      <div class="cart_title base_title a-left">
        {{ t('cart.title') }}
      </div>
      <div class="cart_body">
        <div v-if="cartItems.length" class="cart_items">
          <StockCartCard
            v-for="i in cartItems"
            v-bind="i"
            :key="i.id"
            @remove="remove"
            @quant-changed="changeQuantity"
          />
        </div>
        <div v-else class="cart_empty cart_items">
          {{ t('cart.empty') }}
          <div class="button_wrapper">
            <NuxtLink to="/catalog" class="base_link btn_submit big">{{ t('cart.to_catalog') }}</NuxtLink>
          </div>
        </div>
        <div class="cart_form">
          <CartForm
            :id="formId"
            v-model="order"
            @submit="makeOrder"
          />
          <div class="cart_form-section">
            <div class="cart_form-info">
              <div class="cart_form-label">
                {{ t('cart.total') }}
              </div>
              <div class="cart_form-value">
                ≈ {{ totalPrice }} ₽
              </div>
            </div>
          </div>
          <div class="cart_form-section">
            <div class="cart_form-item">
              <CmsElementsFormCheck v-model="order.privacy" required>
                {{ t('cart.form.consent.start') }} <NuxtLink to="/privacy-policy" class="base_link">{{ $t('cart.form.consent.privacy') }}</NuxtLink>
                {{ t('default.and') }} <NuxtLink to="/terms" class="base_link">{{ t('cart.form.consent.terms') }}</NuxtLink>
                {{ t('cart.form.consent.end') }}
              </CmsElementsFormCheck>
            </div>
            <div class="cart_form-item">
              <CmsElementsFormCheck v-model="order.consent" required>
                {{ t('cart.form.consent.start') }} <NuxtLink to="/public-offer" class="base_link">{{ $t('cart.form.consent.public_offer') }}</NuxtLink>
                {{ t('default.and') }} <NuxtLink to="/return" class="base_link">{{ t('cart.form.consent.return') }}</NuxtLink>
                {{ t('cart.form.consent.end') }}
              </CmsElementsFormCheck>
            </div>
          </div>
          <div class="cart_form-section transparent">
            <button type="submit" class="btn btn_submit" :form="formId" :disabled="isSubmitting">
              {{ t('cart.submit') }}
            </button>
            <span class="caption">{{ t('cart.caption') }}</span>
            <span class="caption">{{ t('cart.subcaption') }}</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'cart',
});

const { t } = useI18n();

const formId = ref('infoForm');

const { cartItems, changeQuantity, remove, clearCart } = useCart();
// const settings = useSettings();

const order = ref({
  phone: '',
  name: '',
  username: '',
  email: '',
  consent: false,
  privacy: false,
});
const isSubmitting = ref(false);
const purchaseIdempotencyKey = ref('');

const subtotal = computed(() => {
  let price = 0;
  cartItems.value.forEach((ci) => {
    if (ci?.quantity) {
      price += ci.price * ci.quantity.value;
    }
    else {
      price += ci.price;
    }
  });
  return price;
});

const totalPrice = computed(() => {
  return subtotal.value;
});

type CreatePurchaseResponse = {
  uuid?: string;
  purchase_uuid?: string;
  payment?: {
    confirmation_url?: string;
  };
  purchase?: {
    uuid?: string;
    purchase_uuid?: string;
  };
};

const makeOrder = async () => {
  if (isSubmitting.value || cartItems.value.length === 0) return;
  if (!order.value.consent || !order.value.privacy) return;

  const newOrder = {
    customer: {
      name: order.value.name,
      phone: order.value.phone,
      username: order.value.username,
      email: order.value.email,
    },
    items: cartItems.value.map(item => ({
      id: item.id,
      properties: item.properties,
      quantity: {
        value: item.quantity?.value ?? 1,
        max: item.quantity?.max,
      },
    })),
    price: subtotal.value,
  };

  isSubmitting.value = true;
  try {
    purchaseIdempotencyKey.value ||= crypto.randomUUID();
    const response = await $fetch<CreatePurchaseResponse>('/internal/purchases', {
      method: 'POST',
      headers: {
        'Idempotency-Key': purchaseIdempotencyKey.value,
      },
      body: newOrder,
    });
    const purchaseUuid = response.uuid ?? response.purchase_uuid ?? response.purchase?.uuid ?? response.purchase?.purchase_uuid;
    if (!purchaseUuid) {
      throw new Error('Purchase UUID is missing in create purchase response');
    }
    order.value = {
      username: '',
      phone: '',
      name: '',
      email: '',
      consent: false,
      privacy: false,
    };
    clearCart();
    purchaseIdempotencyKey.value = '';
    const confirmationUrl = response.payment?.confirmation_url;
    if (confirmationUrl) {
      window.location.assign(confirmationUrl);
      return;
    }
    await navigateTo({
      path: '/cart/purchase',
      query: {
        purchase: purchaseUuid,
      },
    });
  }
  finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.cart{
  padding: 112px 0;
  &_wrapper{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
  }
  &_body{
    margin-top: 40px;
    display: flex;
    gap: 40px;
    align-items: flex-start;
    @media (max-width: 910px) {
      gap: 20px;
    }
    @media (max-width: 830px) {
      flex-direction: column;
      align-items: center;
    }
  }
  &_items{
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  &_empty{
    color: $light-brown;
    .button_wrapper{
      max-width: 400px;
    }
  }
  &_form{
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-width: 500px;
    @media (max-width: 830px) {
      width: 100%;
      max-width: auto;
    }
    &-section{
      padding: 20px;
      border: 1px solid $semi-grey;
      background: $light-pink;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      &.transparent{
        background: transparent;
        padding: 0;
        border: none;
      }
    }
    &-value{
      color: $brown;
      font-weight: 600;
    }
    &-label{
      color: $brown;
      font-weight: 650;
    }
    &-info{
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: $brown;
        &-total{
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          color: $brown;
        }
      }
    }
    .caption{
      text-align: center;
      color: $light-brown;
      font-size: 12px;
    }
}
</style>
