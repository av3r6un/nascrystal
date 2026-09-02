<template>
  <article class="payment">
    <div v-if="!loading && purchase" class="payment_wrapper">
      <div class="payment_icon">
        <Icon name="nsc:diamond" :size="32" />
      </div>
      <div class="payment_title">
        {{ t(`purchase.title.${purchaseStatus}`) }}
      </div>
      <div class="payment_caption">
        {{ t(`purchase.caption.${purchaseStatus}`) }}
      </div>
      <div v-if="purchase.status !== 'canceled'" class="payment_status">
        <OrderStatus v-model="purchase.status" />
      </div>
      <div class="payment_info">
        <div class="payment_info-purchase payment_section">
          <div class="payment_info-title">
            {{ t('purchase.info_title') }}
          </div>
          <div class="payment_info-body">
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.purchase.id') }}
              </div>
              <div class="payment_info-value">
                {{ NASID }}
              </div>
            </div>
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.purchase.date') }}
              </div>
              <div class="payment_info-value">
                {{ normalDate }}
              </div>
            </div>
            <div v-if="purchase.price" class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.purchase.amount') }}
              </div>
              <div class="payment_info-value">
                {{ purchase.price }} ₽
              </div>
            </div>
            <div v-else class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.purchase.total') }}
              </div>
              <div class="payment_info-value">
                {{ purchase.final_price }} ₽
              </div>
            </div>
          </div>
        </div>
        <div class="payment_info-delivery payment_section">
          <div class="payment_info-title">
            {{ t('purchase.delivery.title') }}
          </div>
          <div class="payment_info-body">
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.delivery.title') }}
              </div>
              <div class="payment_info-value">
                {{ deliveryState }}
              </div>
            </div>
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.delivery.receiver') }}
              </div>
              <div class="payment_info-value">
                {{ receiver.name }}
              </div>
            </div>
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.delivery.phone') }}
              </div>
              <div class="payment_info-value">
                {{ receiver.phone }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="payment_links">
        <div v-if="paymentShown" class="payment_action" :class="paymentClass">
          <button v-if="!payment?.paid" type="button" class="btn btn_add" :disabled="paymentLoading" @click="getPaymentLink">
            {{ t('purchase.go_to_payment') }}
          </button>
          <a v-else :href="payment?.confirmation_url" class="base_link btn_add">
            {{ t('purchase.check_payment') }}
          </a>
        </div>
        <div class="payment_leave">
          <NuxtLink to="/catalog" class="base_link btn_add">{{ t('purchase.back_to_catalog') }}</NuxtLink>
        </div>
      </div>
    </div>
    <div v-else class="payment_wrapper">
      <div class="payment_icon">
        <Icon name="nsc:diamond" :size="32" />
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'purchase',
});

const route = useRoute();

const { t } = useI18n();

type PurchasePayment = {
  confirmation_url?: string;
  amount_value: string;
  paid: boolean;
  status: string;
  currency: string;
};

type PurchaseDetails = {
  id: number;
  created_ts: number;
  final_price?: number;
  price?: number;
  status?: string;
  contact_info: {
    delivery?: unknown;
    name?: string;
    phone?: string;
  };
  payment?: PurchasePayment | null;
};

type PurchaseResponse = {
  purchase: PurchaseDetails;
  payment: PurchasePayment;
};

type PurchasePaymentResponse = {
  payment?: PurchasePayment;
};

const purchase = ref<PurchaseDetails | null>(null);
const payment = ref<PurchasePayment | null>(null);
const loading = ref(true);
const paymentLoading = ref(false);

const purchaseStatus = computed(() => purchase.value?.status ?? 'created');

const purchaseID = computed(() => purchase.value?.id ?? 1);

const receiver = computed(() => purchase.value?.contact_info ?? {});

const purchaseDate = computed(() => purchase.value?.created_ts * 1000 ?? new Date().getTime());

const normalDate = computed(() => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(purchaseDate.value);
});

const NASID = computed(() => `NAS-${purchaseID.value.toFixed().padStart(4, '0')}`);

const deliveryState = computed(() => purchase.value?.contact_info?.delivery?.address
  ?? t(`cart.delivery_ways.${purchase.value?.contact_info?.delivery}`).split(' - ')[0]
  ?? t('purchase.delivery.pending'));

onMounted(async () => {
  try {
    const response = await $fetch<PurchaseResponse>(`/internal/purchase`, {
      method: 'GET',
      params: {
        purchase: route.query.purchase,
      },
    });
    purchase.value = response.purchase;
    payment.value = response.payment;
    console.log(payment.value);
    console.log(purchase.value);
  }
  catch {
    purchase.value = null;
  }
  finally {
    loading.value = false;
  }
});

const paymentClass = computed(() => {
  const isPaid = payment.value?.paid && payment.value.status === 'succeeded';
  return isPaid ? 'check' : 'pay';
});

const paymentShown = computed(() => {
  const canBeShownPayment = ['awaiting_payment', 'delivering', 'finished', 'succeeded'];
  return canBeShownPayment.includes(purchase.value?.status ?? '');
});

const getPaymentLink = async () => {
  if (paymentLoading.value) return;

  paymentLoading.value = true;
  try {
    const response = await $fetch<PurchasePaymentResponse>('/internal/purchase/payment', {
      method: 'POST',
      params: {
        purchase: route.query.purchase,
      },
    });

    payment.value = response.payment ?? null;
    const confirmationUrl = response.payment?.confirmation_url;
    if (confirmationUrl) {
      window.location.href = confirmationUrl;
    }
  }
  finally {
    paymentLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.payment{
  padding: 112px 0;
  &_wrapper{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  &_title{
    font-family: $title-font;
    font-size: 32px;
    color: $brown;
    font-weight: 600;
  }
  &_caption{
    color: $light-brown;
    font-size: 15px;
    max-width: 600px;
  }
  &_info{
    display: flex;
    gap: 12px;
    @media screen {
      @media (max-width: 715px) {
        flex-direction: column;
      }
    }
    &-body{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    &-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
    &-value{
      text-align: right;
    }
    &-title{
      color: $brown;
      font-family: $title-font;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    &-label{
      color: $light-brown;
      font-size: 14px;
    }
  }
  &_section{
    background: $light-pink;
    border-radius: 12px;
    border: 1px solid $semi-grey;
    padding: 12px;
    max-width: 360px;
  }
  &_links{
    display: flex;
    gap: 12px;
    font-size: 16px;
    .base_link{
      text-align: center;
    }
    @media (max-width: 400px) {
      flex-direction: column;
      width: 100%;
      gap: 8px;
      .base_link{
        display: flex;
        justify-content: center;
      }
    }
  }
  &_leave {
    .base_link{
      border-color: $brown;
      background: $brown;
      color: $white;
    }
  }
}
</style>
