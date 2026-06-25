<template>
  <article class="payment">
    <div v-if="!loading" class="payment_wrapper">
      <div class="payment_icon">
        <Icon name="nsc:diamond" :size="32" />
      </div>
      <div class="payment_title">
        {{ t(`purchase.title.${payment.status}`) }}
      </div>
      <div class="payment_caption">
        {{ t(`purchase.caption.${payment.status}`) }}
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
                {{ makeNASId(purchase.id) }}
              </div>
            </div>
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.purchase.date') }}
              </div>
              <div class="payment_info-value">
                {{ normalDate(purchase.created_ts) }}
              </div>
            </div>
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.purchase.amount') }}
              </div>
              <div class="payment_info-value">
                {{ payment.amount_value }} ₽
              </div>
            </div>
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.purchase.payment_method') }}
              </div>
              <div class="payment_info-value">
                {{ t(`cart.payment_ways.${purchase.payment_method}`) }}
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
                {{ t('purchase.delivery.method') }}
              </div>
              <div class="payment_info-value">
                {{ makeDelivery(purchase.contact_info.delivery) }}
              </div>
            </div>
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.delivery.receiver') }}
              </div>
              <div class="payment_info-value">
                {{ purchase.contact_info.name }}
              </div>
            </div>
            <div class="payment_info-row">
              <div class="payment_info-label">
                {{ t('purchase.delivery.phone') }}
              </div>
              <div class="payment_info-value">
                {{ purchase.contact_info.phone }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="payment_links">
        <div class="payment_check">
          <a :href="payment.confirmation_url" class="base_link btn btn_add">
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

const payment = ref(null);
const purchase = ref(null);
const loading = ref(true);
const error = ref('');

const normalDate = (ts: number) => {
  const date = new Date(ts * 1000);
  const day = date.getDate().toFixed().padStart(2, '0');
  const month = date.getMonth().toFixed().padStart(2, '0');
  const year = date.getFullYear();
  const hour = date.getHours().toFixed().padStart(2, '0');
  const minute = date.getMinutes().toFixed().padStart(2, '0');

  return `${day}-${month}-${year} ${hour}:${minute}`;
};

const makeNASId = (id: number) => {
  return `NAS-${id.toFixed().padStart(4, '0')}`;
};

const makeDelivery = (way: string) => {
  const foundWay = t(`cart.delivery_ways.${way}`);
  const shortWay = foundWay ? foundWay.split(' - ')[0] : 'уточним по телефону';
  return shortWay;
};

onMounted(async () => {
  try {
    const response = await $fetch(`/internal/purchase`, {
      method: 'GET',
      params: {
        purchase: route.query.purchase,
      },
    });
    payment.value = response.payment;
    purchase.value = response.purchase;
  }
  catch (err) {
    error.value = err;
  }
  finally {
    loading.value = false;
  }
});
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
    gap: 20px;
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
