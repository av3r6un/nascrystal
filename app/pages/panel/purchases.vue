<template>
  <article class="purchases">
    <div class="purchases_title base_title">
      {{ t('panel.purchases.title') }}
    </div>
    <div class="purchases_body">
      <div v-if="pending" class="purchases_state">
        {{ t('loading') }}
      </div>
      <div v-else-if="error" class="purchases_state">
        {{ t('panel.purchases.load_error') }}
      </div>
      <div v-else class="purchases_body-content">
        <div class="purchases_table">
          <div class="purchases_table-header">
            <div class="purchases_table-index th">
              {{ t('panel.purchases.table.index') }}
            </div>
            <div class="purchases_table-date th">
              {{ t('panel.purchases.table.date') }}
            </div>
            <div class="purchases_table-contact th">
              {{ t('panel.purchases.table.contacts') }}
            </div>
            <div class="purchases_table-product th">
              {{ t('panel.purchases.table.product') }}
            </div>
            <div class="purchases_table-price th">
              {{ t('panel.purchases.table.price') }}
            </div>
            <div class="purchases_table-delivery th">
              {{ t('panel.purchases.table.delivery') }}
            </div>
            <div class="purchases_table-status th">
              {{ t('panel.purchases.table.status') }}
            </div>
          </div>
          <div class="purchases_table-body">
            <div v-for="pur in data.items" :key="pur.id" class="purchases_table-row tr">
              <div class="purchases_table-data td index">
                {{ makeNASID(pur.id) }}
              </div>
              <div class="purchases_table-data td date">
                {{ toNormalDate(pur.created_ts) }}
              </div>
              <div class="purchases_table-data td contacts">
                <span :title="pur.contact_info.phone">
                  <a :href="`tel:${pur.contact_info.phone}`" class="base_link">
                    {{ pur.contact_info.name }}
                  </a>
                </span>
              </div>
              <div class="purchases_table-data td product">
                <span v-for="(pr, idx) in pur.products" :key="pr.id" :title="pr.sku" @click="toClipboard(pr.sku)">
                  {{ pr.name }} (x{{ pr.quantity }})<span v-if="idx < pur.products.length - 1">, </span>
                </span>
              </div>
              <div class="purchases_table-data td price">
                {{ pur.final_price }} ₽
              </div>
              <div class="purchases_table-data td delivery">
                {{ t(`panel.purchases.deliveries.${pur.contact_info.delivery}`) }}
              </div>
              <div class="purchases_table-data td status" :class="pur.status">
                <div class="purchase_status">
                  {{ t(`panel.purchases.statuses.${pur.status}`) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'purchases',
  layout: 'panel',
});

const { t } = useI18n();

const auth = useAuthStore();

const { data, pending, error, refresh } = await useAsyncData(
  'panel-purchases',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    const response = await $fetch<Record<string, unknown>>('/internal/purchases', {
      headers: auth.authHeader,
    });
    return { items: response };
  },
  {
    server: false,
    default: () => ({ items: [] }),
  },
);

console.log(data.value.items);

const toNormalDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.getMonth().toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${day}.${month}.${year}`;
};

const makeNASID = (id: number) => {
  return `NAS-${id.toString().padStart(3, '0')}`;
};

const toClipboard = (val: string) => {
  navigator.clipboard.writeText(val);
};
</script>

<style lang="scss" scoped>
.purchases{
  &_body{
    &-content{
      max-width: 1440px;
    }
  }
  &_table{
    --stock-column-index: minmax(110px, 0.6fr);
    --stock-column-date: minmax(100px, 0.5fr);
    --stock-column-contact: minmax(140px, 1fr);
    --stock-column-product: minmax(280px, 3fr);
    --stock-column-price: minmax(90px, 0.7fr);
    --stock-column-delivery: minmax(90px, 0.7fr);
    --stock-column-status: minmax(80px, 0.5fr);
    --stock-columns:
      var(--stock-column-index)
      var(--stock-column-date)
      var(--stock-column-contact)
      var(--stock-column-product)
      var(--stock-column-price)
      var(--stock-column-delivery)
      var(--stock-column-status);
    background: $light-pink;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid $semi-grey;
    border-radius: 12px;
    width: 100%;
    overflow-x: auto;
    user-select: none;
    &::-webkit-scrollbar{
      -webkit-appearance: none;
      height: 0;
    }
    &-header{
      display: grid;
      grid-template-columns: var(--stock-columns);
      min-height: 40px;
      align-items: center;
      border-bottom: .8px solid $semi-grey;
      color: $light-brown;
    }
    &-body{
      display: flex;
      flex-direction: column;
    }
    &-row{
      display: grid;
      grid-template-columns: var(--stock-columns);
      align-items: center;
      min-height: 72px;

      &:not(:last-child){
        border-bottom: 1px solid $pinky;
      }
    }
    &-index{
      text-align: center;
    }
    &-status{
      text-align: center;
      margin-left: -8px;
    }
    &-data{
      color: $light-brown;
      &.index{
        color: $brown;
        font-weight: 600;
        text-align: center;
      }
      &.contacts{
        color: $brown;
      }
      &.product{
        font-weight: 600;
        color: $brown;
        span{
          cursor: pointer;
        }
      }
      &.status{
        display: flex;
        justify-content: center;
        align-items: center;
        .purchase_status{
          display: inline;
          padding: 2px 12px;
          border-radius: 20px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
        }
        &.created {
          .purchase_status{
            background: $brown;
            color: $white;
          }
        }
      }
    }
  }
}
</style>
