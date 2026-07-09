<template>
  <article class="purchase">
    <div v-if="loading" class="purchase_wrapper">
      {{ t('loading') }}
    </div>
    <div v-else-if="error || !pur" class="purchase_wrapper">
      {{ t('panel.purchases.load_error') }}
    </div>
    <div v-else class="purchase_wrapper">
      <div class="purchase_stock">
        <div class="purchase_stock-title">
          <span class="title base_title">
            {{ t('panel.purchases.table.goods') }}
          </span>
          <!-- <button type="button" class="btn btn_add">
            <Icon name="nsc:plus-small" :size="24" />
          </button> -->
        </div>
        <div
          v-for="i in purchaseProducts"
          :key="i.sku"
          class="purchase_stock-item"
        >
          <StockCartCard
            :id="i.id"
            :name="i.name"
            :quantity="i.quantity"
            :properties="normalProperties(i.properties)"
            :price="i.price"
            @quant-changed="(_id, value) => updateQuantity(i.sku, value)"
          />
        </div>
      </div>
      <div class="purchase_info">
        <div class="purchase_info-wrapper">
          <div class="purchase_info-title">
            <span class="title">
              {{ t('panel.purchases.purchase') }}
              от
              {{ d(new Date(pur.created_ts * 1000), 'short') }}
            </span>
            <span class="time">{{ d(new Date(pur.created_ts * 1000), 'small') }}</span>
          </div>
          <div class="purchase_info-form panel_section">
            <div class="purchase_info-block contacts">
              <CmsElementsInput
                v-model="contactName"
                name="panel.purchases.form.name"
                placeholder="panel.purchases.form.name_ph"
              />
              <CmsElementsInput
                v-model="contactPhone"
                name="panel.purchases.form.phone"
                placeholder="panel.purchases.form.phone_ph"
              />
            </div>
            <div class="purchase_info-block contacts">
              <CmsElementsInput
                v-model="contactUsername"
                name="panel.purchases.form.telegram_id"
                placeholder="@username"
              />
              <CmsElementsInput
                v-model="contactEmail"
                type="email"
                name="panel.purchases.form.email"
                placeholder="username@example.com"
              />
            </div>
            <div class="purchase_info-block delivery">
              <div class="block_selection">
                <div class="selection_label">
                  {{ t('panel.purchases.form.delivery_type') }}
                </div>
                <PanelSelection
                  v-model="deliveryType"
                  :options="deliveryWays"
                  placeholder="panel.purchases.form.delivery_type_ph"
                />
              </div>
              <CmsElementsInput
                v-model="deliveryAddress"
                name="panel.purchases.form.delivery_address"
                placeholder="panel.purchases.form.delivery_address_ph"
              />
              <CmsElementsInput
                v-model="deliveryCost"
                name="panel.purchases.form.delivery_cost"
                class="pricetag"
                placeholder="panel.purchases.form.delivery_cost_ph"
              />
            </div>
            <div class="purchase_info-block summary">
              <div class="purchase_info-price">
                <span class="title">{{ t('panel.purchases.form.final_price') }}</span>
                <div class="price_info">
                  <span class="price" :class="{ active: payment?.confirmation_url }">
                    {{ totalPrice }} ₽
                  </span>
                  <span v-if="payment?.confirmation_url" @click="toClipboard(payment.confirmation_url)">
                    <Icon name="nsc:copy" :size="16" />
                  </span>
                </div>
              </div>
              <div v-if="pur.status !== 'delivering'" class="purchase_info-action">
                <button type="button" class="btn btn_submit" :disabled="updating || !hasChanges" @click="updatePurchase">
                  {{ t('panel.purchases.form.submit') }}
                </button>
              </div>
            </div>
            <div v-if="pur.status === 'delivering'" class="purchase_info-state">
              <span class="caption">
                Заказ доставлен?
              </span>
              <button type="button" class="btn btn_submit" :disabled="finishing" @click="finishPurchase">
                {{ t('panel.purchases.form.update_delivery') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'purchase',
  layout: 'panel',
});

const { t, d, tm } = useI18n();
const route = useRoute();
const auth = useAuthStore();

type ProductQuantity = {
  value: number;
  max: number;
};

type PurchaseDelivery = {
  type: string;
  address: string;
  cost: number;
};

type PurchasePayment = {
  id: number;
  uuid: string;
  status: string;
  amount_value: string;
  paid: boolean;
  confirmation_url: string;
  return_url: string;
  created_ts: string;
};

type PurchaseProduct = {
  id?: number;
  sku: string;
  name: string;
  quantity: ProductQuantity;
  price: number;
  properties?: Array<{
    property: {
      name: string;
    };
    value?: string;
    name?: string;
  }>;
};

type PurchaseDetails = {
  id: number;
  created_ts: number;
  final_price?: number;
  status?: string;
  contact_info: {
    delivery?: PurchaseDelivery;
    name?: string;
    phone?: string;
    email: string;
    username?: string;
  };
  products?: PurchaseProduct[];
  payment: PurchasePayment | null;
};

const { data, pending: loading, error } = await useAsyncData(
  () => `panel-purchase`,
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    return await $fetch<PurchaseDetails>('/internal/purchase', {
      headers: auth.authHeader,
      params: { id: route.params.id },
    });
  },
  {
    server: false,
    default: () => null,
  },
);

const pur = computed(() => data.value);

const payment = computed(() => data.value?.payment ?? null);

const purchaseProducts = computed(() => pur.value?.products ?? []);

const updating = ref(false);
const finishing = ref(false);

const currentDelivery = computed<PurchaseDelivery>(() => {
  const delivery = pur.value?.contact_info.delivery;
  if (typeof delivery === 'object' && delivery !== null) {
    return {
      type: delivery.type ?? '',
      address: delivery.address ?? '',
      cost: Number(delivery.cost) || 0,
    };
  }
  return {
    type: typeof delivery === 'string' ? delivery : '',
    address: '',
    cost: 0,
  };
});

const updateContactInfo = (patch: Partial<PurchaseDetails['contact_info']>) => {
  if (!data.value) return;
  data.value = {
    ...data.value,
    contact_info: {
      ...data.value.contact_info,
      ...patch,
    },
  };
};

const updateDeliveryFields = (patch: Partial<PurchaseDelivery>) => {
  updateContactInfo({
    delivery: {
      ...currentDelivery.value,
      ...patch,
    },
  });
};

const contactName = computed({
  get: () => pur.value?.contact_info.name ?? '',
  set: name => updateContactInfo({ name }),
});

const contactPhone = computed({
  get: () => pur.value?.contact_info.phone ?? '',
  set: phone => updateContactInfo({ phone }),
});

const contactUsername = computed({
  get: () => pur.value?.contact_info.username ?? '',
  set: username => updateContactInfo({ username }),
});

const contactEmail = computed({
  get: () => pur.value?.contact_info.email ?? '',
  set: email => updateContactInfo({ email }),
});

const deliveryType = computed({
  get: () => currentDelivery.value.type,
  set: type => updateDeliveryFields({ type }),
});

const deliveryAddress = computed({
  get: () => currentDelivery.value.address,
  set: address => updateDeliveryFields({ address }),
});

const deliveryCost = computed({
  get: () => currentDelivery.value.cost,
  set: cost => updateDeliveryFields({ cost: Number(cost) || 0 }),
});

const totalPrice = computed(() => {
  const goodsPrice = purchaseProducts.value.reduce((sum, product) => sum + product.price * product.quantity.value, 0);
  return goodsPrice + currentDelivery.value.cost;
});

const purchasePayload = computed(() => ({
  contact_info: {
    ...pur.value?.contact_info,
    name: contactName.value,
    phone: contactPhone.value,
    username: contactUsername.value,
    email: contactEmail.value,
    delivery: currentDelivery.value,
  },
  delivery: {
    ...currentDelivery.value,
    price: currentDelivery.value.cost,
  },
  products: purchaseProducts.value.map(product => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    properties: product.properties ?? [],
  })),
  final_price: totalPrice.value,
}));

const savedPurchasePayload = ref('');
const hasChanges = computed(() => savedPurchasePayload.value !== JSON.stringify(purchasePayload.value));

watch(purchasePayload, (payload) => {
  if (!savedPurchasePayload.value && data.value) {
    savedPurchasePayload.value = JSON.stringify(payload);
  }
}, { immediate: true });

const updatePurchase = async () => {
  if (updating.value || !hasChanges.value) return;

  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  updating.value = true;
  try {
    data.value = await $fetch<PurchaseDetails>('/internal/purchase', {
      method: 'POST',
      headers: auth.authHeader,
      params: { id: route.params.id },
      body: purchasePayload.value,
    });
    savedPurchasePayload.value = JSON.stringify(purchasePayload.value);
  }
  finally {
    updating.value = false;
  }
};

const finishPurchase = async () => {
  if (finishing.value) return;

  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  finishing.value = true;
  try {
    data.value = await $fetch<PurchaseDetails>('/internal/purchase/finish', {
      method: 'POST',
      headers: auth.authHeader,
      params: { id: route.params.id },
    });
  }
  finally {
    finishing.value = false;
  }
};

const deliveryWays = computed(() => {
  const ways = tm('cart.delivery_ways');
  return Object.entries(ways).map(([key, value]) => ({ id: key, name: String(value).split(' - ')[0] }));
});

const normalProperties = (prop: Array<object>) => prop.map(property => property.name ?? property.value);

const updateQuantity = (sku: string, newQuantity: number) => {
  if (!data.value?.products) return;
  data.value = {
    ...data.value,
    products: data.value.products.map(product => product.sku === sku
      ? {
          ...product,
          quantity: {
            ...product.quantity,
            value: newQuantity,
          },
        }
      : product),
  };
};

const toClipboard = async (val: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(val);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = val;
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
};
</script>

<style lang="scss" scoped>
.purchase{
  container-type: inline-size;
  @container (max-width: 680px) {
    &_wrapper{
      flex-direction: column;
    }
  }
  &_info{
    &-price{
      display: flex;
      flex-direction: column;
      gap: 5px;
      .title{
        color: $brown;
        font-size: 20px;
        font-weight: 600;
      }
      .price_info{
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        .price.active{
          text-decoration: underline;
        }
      }
    }
    &-state{
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: center;
      span{
        color: $light-brown;
      }
    }
    &-wrapper{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    &-title{
      font-family: $title-font;
      display: flex;
      justify-content: space-between;
      color: $light-brown;
      font-weight: 600;
      margin-bottom: 7px;
      font-size: 24px;
    }
    &-block{
      display: flex;
      gap: 8px;
      .input{
        width: 100%;
      }
      &.delivery{
        .input{
          width: 50%;
        }
        .block_selection{
          width: 70%;
          .selection{
            height: 45px;
            &_default{
              font-size: 14px !important;
            }
          }
        }
        .pricetag{
          width: 35%;
        }
      }
      &.summary{
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
  &_stock{
    &-title{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      .base_title{
        margin-bottom: 0;
      }
    }
  }
  &_wrapper{
    display: flex;
    gap: 12px;
  }
}
</style>
