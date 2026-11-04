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
          <div v-if="deliveryError" class="purchase_delivery panel_section">
            <template v-if="pur.delivery?.module === 'cdek'">
              <p role="alert">
                {{ deliveryError }}
              </p>
            </template>
          </div>
          <p v-if="pur.delivery_update_status === 'draft'" role="status">
            Изменения сохранены на сайте. Повторите сохранение после подтверждения регистрации СДЭК.
          </p>
          <p v-else-if="pur.delivery_status?.editing?.state === 'accepted' || pur.delivery_status?.editing?.state === 'pending'" role="status">
            Изменения отправлены в СДЭК и ожидают подтверждения.
          </p>
          <fieldset :disabled="pur.delivery_editable === false || updating" style="border: 0; padding: 0; margin: 0; min-width: 0;">
            <PanelPurchaseForm
              :recipient="recipient"
              :username="pur.contact_info.username"
              :delivery-type="pur.delivery?.module ?? ''"
              :delivery-data="pur.delivery?.data ?? {}"
              :payment-data="pur.payment"
              :city-codes="cityCodes ?? pur.cdek_city_codes ?? []"
              :cities-loading="citiesLoading"
              :cities-error="citiesError"
              :delivery-state="deliveryState"
              @fetch-codes="searchCities"
              @update-form="updateForm"
              @refresh-state="refreshState"
              @dispatch="deliveryAction('dispatch')"
            />
            <button type="button" class="btn btn_submit" :disabled="updating || !canSavePurchase || pur.delivery_editable === false" @click="updatePurchase">
              {{ t('panel.submit') }}
            </button>
          </fieldset>
        </div>
        <div class="purchase_delivery" />
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'purchase',
  layout: 'panel',
});

const { t, d } = useI18n();
const route = useRoute();
const auth = useAuthStore();

type ProductQuantity = {
  value: number;
  max: number;
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
  delivery_editable?: boolean;
  delivery_update_status?: string | null;
  delivery_can_dispatch?: boolean;
  delivery_status?: {
    status: string; tracking_number?: string;
    registration?: { state?: string; errors?: { message: string }[] };
    editing?: { state?: string; errors?: { message: string }[] };
    cancellation?: { state?: string; errors?: { message: string }[] };
  } | null;
  cdek_city_codes?: { id: string; name: string; code: number; city: string; region: string; region_code: number | null }[];
  id: number;
  created_ts: number;
  final_price?: number;
  status?: string;
  contact_info: {
    name?: string;
    phone?: string;
    email: string;
    username?: string;
  };
  products?: PurchaseProduct[];
  payment: PurchasePayment | null;
  delivery?: { module: string; data: { recipient?: Record<string, unknown>; [key: string]: unknown } } | null;
};

const { data, pending: loading, error } = await useAsyncData(
  () => `panel-purchase-${route.params.id}`,
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

const cityCodes = ref<PurchaseDetails['cdek_city_codes']>();
const citiesLoading = ref(false);
const citiesError = ref(false);
let cityTimer: ReturnType<typeof setTimeout>;
let cityController: AbortController | undefined;
let cityVersion = 0;
function searchCities(value: string) {
  clearTimeout(cityTimer);
  cityController?.abort();
  const current = ++cityVersion;
  cityCodes.value = [];
  citiesError.value = false;
  citiesLoading.value = false;
  const name = value.trim();
  if (name.length < 3) return;
  citiesLoading.value = true;
  cityTimer = setTimeout(async () => {
    const request = new AbortController();
    cityController = request;
    try {
      if (!await auth.ensureValidAccessToken()) throw new Error('Unauthorized');
      if (current !== cityVersion) return;
      const result = await $fetch<{ items: PurchaseDetails['cdek_city_codes'] }>('/internal/delivery/cities', {
        query: { name }, headers: auth.authHeader, signal: request.signal, retry: 0,
      });
      if (current === cityVersion) cityCodes.value = result.items ?? [];
    }
    catch {
      if (current === cityVersion && !request.signal.aborted) citiesError.value = true;
    }
    finally {
      if (current === cityVersion) citiesLoading.value = false;
    }
  }, 300);
}
onBeforeUnmount(() => {
  clearTimeout(cityTimer);
  cityController?.abort();
  cityVersion++;
});
watch(() => route.params.id, () => {
  searchCities('');
  cityCodes.value = undefined;
});

const deliveryState = computed(() => (
  {
    internal: pur.value?.status,
    editable: pur.value?.delivery_editable,
    canDispatch: pur.value?.delivery_can_dispatch,
    registration: pur.value?.delivery_status?.registration,
    editing: pur.value?.delivery_status?.editing,
    cancellation: pur.value?.delivery_status?.cancellation,
    cdekStatus: pur.value?.delivery_status?.status,
    trackNumber: pur.value?.delivery_status?.tracking_number,
  }
));

const recipient = computed(() => ({
  name: pur.value?.contact_info.name ?? '',
  email: pur.value?.contact_info.email ?? '',
  phones: [{ number: pur.value?.contact_info.phone ?? '' }],
  ...pur.value?.delivery?.data.recipient,
}));

const purchaseProducts = computed(() => pur.value?.products ?? []);

const deliveryError = ref('');

const deliveryAction = async (action: string) => {
  if (updating.value) return;
  if (hasChanges.value) {
    deliveryError.value = 'Сначала сохрани изменения заказа.';
    return;
  }
  updating.value = true;
  deliveryError.value = '';
  try {
    if (!await auth.ensureValidAccessToken()) {
      deliveryError.value = 'Войди в панель заново, чтобы выполнить действие со СДЭК.';
      return;
    }
    data.value = await $fetch<PurchaseDetails>('/internal/purchase/delivery', {
      method: 'POST', headers: auth.authHeader, query: { id: route.params.id }, body: { action },
    });
    savedPurchasePayload.value = JSON.stringify(purchasePayload.value);
  }
  catch (error) {
    deliveryError.value = (error as { data?: { data?: { message?: string } } }).data?.data?.message
      || 'Не удалось выполнить действие со СДЭК';
    try {
      data.value = await $fetch<PurchaseDetails>('/internal/purchase', {
        headers: auth.authHeader, query: { id: route.params.id },
      });
      savedPurchasePayload.value = JSON.stringify(purchasePayload.value);
    }
    catch { /* Keep the action error if the latest status cannot be loaded. */ }
  }
  finally {
    updating.value = false;
  }
};

const refreshState = (section: string) => {
  console.log('refreshing', section);
  if (section === 'delivery') deliveryAction('refresh');
};

const updating = ref(false);

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

const totalPrice = computed(() => {
  return purchaseProducts.value.reduce((sum, product) => sum + product.price * product.quantity.value, 0);
});

const purchasePayload = computed(() => ({
  delivery: pur.value?.delivery ?? null,
  contact_info: {
    ...pur.value?.contact_info,
    name: contactName.value,
    phone: contactPhone.value,
    username: contactUsername.value,
    email: contactEmail.value,
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

watch(() => pur.value?.id, () => {
  savedPurchasePayload.value = pur.value ? JSON.stringify(purchasePayload.value) : '';
}, { immediate: true });

const canSavePurchase = computed(() => hasChanges.value || pur.value?.delivery_update_status === 'draft');

const updatePurchase = async () => {
  if (updating.value || !canSavePurchase.value || pur.value?.delivery_editable === false) return;

  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  updating.value = true;
  deliveryError.value = '';
  try {
    const { delivery, ...purchase } = purchasePayload.value;
    const { delivery: savedDelivery, ...savedPurchase } = JSON.parse(savedPurchasePayload.value);
    // The backend accepts delivery separately from product/payment edits.
    for (const body of [
      JSON.stringify(purchase) !== JSON.stringify(savedPurchase) ? purchase : null,
      pur.value?.delivery_update_status === 'draft' || JSON.stringify(delivery) !== JSON.stringify(savedDelivery) ? { delivery } : null,
    ]) {
      if (!body) continue;
      const updated = await $fetch<PurchaseDetails>('/internal/purchase', {
        method: 'POST', headers: auth.authHeader, params: { id: route.params.id }, body,
      });
      data.value = updated;
      savedPurchasePayload.value = JSON.stringify(purchasePayload.value);
      if (!('delivery' in body) && JSON.stringify(delivery) !== JSON.stringify(savedDelivery)) {
        data.value = { ...updated, delivery };
      }
    }
  }
  catch (error) {
    deliveryError.value = (error as { data?: { data?: { message?: string } } }).data?.data?.message
      || 'Не удалось сохранить заказ и данные СДЭК';
  }
  finally {
    updating.value = false;
  }
};

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

const updateForm = (key: string, value: Record<string, unknown>) => {
  if (!data.value || data.value.delivery_editable === false) return;
  if (key === 'contact_info') {
    updateContactInfo(value);
    return;
  }
  const delivery = data.value.delivery ?? { module: '', data: {} };
  data.value = { ...data.value, delivery: { ...delivery, data: {
    ...delivery.data,
    recipient: recipient.value,
    ...(key === 'recipient' ? { recipient: value } : value),
  } } };
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
