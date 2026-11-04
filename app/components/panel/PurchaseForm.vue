<template>
  <div class="purchase_form">
    <div class="purchase_form-block contacts panel_section">
      <div class="panel_section-title">
        {{ t('panel.purchases.form.contact_details') }}
      </div>
      <Checkbox
        v-model="recipientStatus"
        title="panel.purchases.form.recipient_status"
        description="panel.purchases.form.recipient_is_company"
      />
      <CmsElementsInput
        v-if="recipientStatus"
        v-model="recipientCompanyName"
        name="panel.purchases.form.company_name"
        placeholder="panel.purchases.form.company_name_ph"
        required
      />
      <CmsElementsInput
        v-else
        v-model="recipientName"
        name="panel.purchases.form.name"
        placeholder="panel.purchases.form.name_ph"
        required
      />
      <CmsElementsInput
        v-if="recipientStatus"
        v-model="recipientTIN"
        type="text"
        inputmode="numeric"
        name="panel.purchases.form.tin"
        placeholder="panel.purchases.form.tin_ph"
        required
      />
      <CmsElementsPhone
        v-model="recipientPhone"
        name="panel.purchases.form.phone"
        placeholder="panel.purchases.form.phone_ph"
        required
      />
      <CmsElementsInput
        v-model="recipientEmail"
        type="email"
        name="panel.purchases.form.email"
        placeholder="username@example.com"
        required
      />
      <CmsElementsInput
        v-model="recipientID"
        name="panel.purchases.form.telegram_id"
        placeholder="@username"
      />
    </div>
    <div class="purchase_form-block delivery panel_section">
      <div class="panel_section-title">
        {{ t('panel.purchases.form.delivery_details') }}
        <span class="delivery_title">&laquo;{{ t(`panel.purchases.form.delivery.${deliveryType}`) }}&raquo;</span>
        <div class="refresh_button" @click="emit('refreshState', 'delivery')">
          <Icon name="nsc:refresh" :size="24" />
        </div>
      </div>
      <div
        v-if="deliveryState?.editable && deliveryState?.cdekStatus"
        class="purchase_form-block__item states"
        :class="{ framed: deliveryState.editable }"
      >
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.delivery_state.phs.purchase_state') }}</span>
          <span class="data">
            {{ t(`panel.purchases.delivery_state.purchase.${deliveryState?.internal}`) }}
          </span>
        </div>
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.delivery_state.phs.delivery_state') }}</span>
          <span class="data">
            {{ t(`panel.purchases.delivery_state.cdek.${deliveryState.cdekStatus}`) }}
          </span>
        </div>
        <div class="receipt-row small">
          <span class="label">{{ t('panel.purchases.delivery_state.phs.registration_state') }}</span>
          <span class="data">
            {{ t(`panel.purchases.delivery_state.registration.${deliveryState?.registration?.state}`) }}
          </span>
        </div>
        <div v-if="deliveryState.trackNumber" class="receipt-row" @click="toClipboard(deliveryState.trackNumber)">
          <span class="label">{{ t('panel.purchases.delivery_state.phs.tracking_number') }}</span>
          <span class="data">
            {{ deliveryState.trackNumber }}
          </span>
        </div>
        <div v-if="deliveryState?.editing?.message" class="receipt-row small">
          <span class="label">{{ t('panel.purchases.delivery_state.phs.editing') }}</span>
          <span class="data" :title="deliveryState.editing.message">
            {{ deliveryState.editing.message }}
          </span>
        </div>
        <div v-if="deliveryState.cancellation?.message" class="receipt-row small">
          <span class="label">{{ t('panel.purchases.delivery_state.phs.cancellation') }}</span>
          <span class="data" :title="deliveryState.cancellation.message">
            {{ deliveryState.cancellation.message }}
          </span>
        </div>
      </div>
      <div v-if="deliveryState?.editable" class="purchase_form-block__item">
        <div class="purchase_form-block__item">
          <div class="name">
            {{ t('panel.purchases.form.delivery_method') }}
          </div>
          <PanelSelection
            v-model="deliveryMethod"
            :options="deliveryMethods"
          />
        </div>
      </div>
      <div v-else class="purchase_form-block__item">
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.form.delivery_method') }}</span>
          <span class="data">
            {{ t(`panel.purchases.form.delivery_methods.${deliveryMethod}`) }}
          </span>
        </div>
      </div>
      <div v-if="deliveryMethod === 'pickup_point'" class="purchase_form-block__item">
        <CmsElementsInput
          v-if="deliveryState?.editable"
          v-model="deliveryPoint"
          placeholder="panel.purchases.form.delivery_point_ph"
          name="panel.purchases.form.delivery_point"
          required
        />
        <div v-else class="receipt-row">
          <span class="label">{{ t('panel.purchases.form.delivery_point_ph') }}</span>
          <span class="data">
            {{ deliveryPoint }}
          </span>
        </div>
      </div>
      <div v-else class="purchase_form-block__item">
        <div v-if="deliveryState?.editable" class="purchase_form-block__item-first">
          <div class="name required">
            {{ t('panel.purchases.form.city_code') }}
          </div>
          <CmsElementsSmallSearch
            v-model="deliveryLocation"
            :options="cityCodes"
            :loading="citiesLoading"
            :error="citiesError"
            :search-placeholder="t('panel.purchases.form.city_code_ph')"
            @search="emit('fetchCodes', $event)"
          />
        </div>
        <div v-else class="receipt-row small">
          <span class="label">{{ t('panel.purchases.form.city_code') }}</span>
          <span class="data">{{ deliveryLocation.name }}</span>
        </div>
        <CmsElementsInput
          v-if="deliveryState?.editable"
          v-model="deliveryAddress"
          name="panel.purchases.form.address"
          placeholder="panel.purchases.form.address_ph"
          required
        />
        <div v-else class="receipt-row small">
          <span class="label">{{ t('panel.purchases.form.address') }}</span>
          <span class="data">{{ deliveryAddress }}</span>
        </div>
      </div>
      <div v-if="deliveryState?.editable" class="purchase_form-block__item dimensions">
        <div class="purchase_form-block__row">
          <CmsElementsInput
            :model-value="deliveryData.package?.weight ?? 0"
            type="number"
            name="panel.purchases.form.delivery_weight"
            placeholder="100 г"
            class="dimension"
            required
            @update:model-value="value => updatePackage('weight', value)"
          />
          <CmsElementsInput
            :model-value="deliveryData.package?.length ?? 0"
            type="number"
            name="panel.purchases.form.delivery_length"
            placeholder="10 см"
            class="dimension"
            required
            @update:model-value="value => updatePackage('length', value)"
          />
        </div>
        <div class="purchase_form-block__row">
          <CmsElementsInput
            :model-value="deliveryData.package?.width ?? 0"
            type="number"
            name="panel.purchases.form.delivery_width"
            placeholder="10 см"
            class="dimension"
            required
            @update:model-value="value => updatePackage('width', value)"
          />
          <CmsElementsInput
            :model-value="deliveryData.package?.height ?? 0"
            type="number"
            name="panel.purchases.form.delivery_height"
            placeholder="10 см"
            class="dimension"
            required
            @update:model-value="value => updatePackage('height', value)"
          />
        </div>
      </div>
      <div v-else class="purchase_form-block__item dimensions">
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.form.delivery_weight') }}</span>
          <span class="data">{{ deliveryData.package?.weight }}</span>
        </div>
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.form.delivery_dimensions') }}</span>
          <span class="data">
            {{ deliveryData.package?.length }}x{{ deliveryData.package?.height }}x{{ deliveryData.package?.width }}
          </span>
        </div>
      </div>
      <CmsElementsCheckbox
        v-if="deliveryState?.editable"
        v-model="rPackd"
        title="panel.purchases.form.review_and_packed"
        description="panel.purchases.form.review_caption"
      />
      <CmsElementsCheckbox
        v-if="deliveryState?.editable"
        v-model="dConfirmed"
        title="panel.purchases.form.recipient_collection_confirmed"
        description="panel.purchases.form.collection_confirmation"
      />
      <div v-else class="receipt-row">
        <span class="label">{{ t('panel.purchases.form.recipient_collection_confirmed') }}</span>
        <span class="data">
          {{ t(`default.${dConfirmed}`) }}
        </span>
      </div>
      <button v-if="deliveryState?.canDispatch" type="button" class="btn btn_submit" @click="emit('dispatch')">
        {{ t('panel.purchases.form.dispatch') }}
      </button>
    </div>
    <div v-if="paymentData" class="purchase_form-black payment panel_section">
      <div class="panel_section-title">
        {{ t('panel.purchases.form.payment_details') }}
        <span class="provider_title">&laquo;{{ paymentProvider }}&raquo;</span>
        <div class="refresh_button" @click="emit('refreshState', 'payment')">
          <Icon name="nsc:refresh" :size="24" />
        </div>
      </div>
      <div class="purchase_form-receipt">
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.form.payment_date') }}</span>
          <span class="data">{{ d(paymentUpdated) }}</span>
        </div>
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.form.payment_status') }}</span>
          <span class="data">{{ t(`panel.purchases.form.payment_statuses.${paymentStatus}`) }}</span>
        </div>
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.form.payment_amount') }}</span>
          <span class="data">{{ paymentAmount }} ₽</span>
        </div>
        <div class="receipt-row">
          <span class="label">{{ t('panel.purchases.form.payment_confirmation') }}</span>
          <span class="data">
            <a :href="paymentConfirm" class="base_link">{{ t('default.go_to') }}</a>
          </span>
        </div>
      </div>
    </div>
    <div class="purchase_form-block summary" />
    <div class="purchase_form-block action" />
  </div>
</template>

<script lang="ts" setup>
import Checkbox from '../cms/elements/Checkbox.vue';
import type { PropType } from 'vue';

const { d, t } = useI18n();

const emit = defineEmits(['updateForm', 'refreshState', 'dispatch', 'fetchCodes']);
const props = defineProps({
  recipient: {
    type: Object,
    required: true,
  },
  cityCodes: {
    type: Array as PropType<Record<string, unknown>[]>,
    required: true,
  },
  citiesLoading: Boolean,
  citiesError: Boolean,
  username: String,
  productsCost: {
    type: Number,
    required: false,
  },
  deliveryType: {
    type: String,
    required: true,
  },
  deliveryData: {
    type: Object,
    required: true,
  },
  deliveryState: {
    type: Object,
    required: false,
  },
  paymentData: {
    type: Object,
    required: false,
  },
});

const recipientName = computed({
  get: () => { return props.recipient.name; },
  set: (val) => { emit('updateForm', 'recipient', { ...props.recipient, name: val }); },
});

const recipientCompanyName = computed({
  get: () => props.recipient.company ?? props.recipient.company_name,
  set: (val) => {
    const { company_name: _legacy, ...recipient } = props.recipient;
    emit('updateForm', 'recipient', { ...recipient, company: val });
  },
});

const recipientTIN = computed({
  get: () => props.recipient.tin,
  set: (val) => { emit('updateForm', 'recipient', { ...props.recipient, tin: val }); },
});

const recipientPhone = computed({
  get: () => props.recipient.phones?.[0]?.number ?? '',
  set: (val) => { emit('updateForm', 'recipient', { ...props.recipient, phones: [{ number: val }, ...(props.recipient.phones?.slice(1) ?? [])] }); },
});

const recipientEmail = computed({
  get: () => { return props.recipient.email; },
  set: (val) => { emit('updateForm', 'recipient', { ...props.recipient, email: val }); },
});

const recipientID = computed({
  get: () => props.username ?? '',
  set: (val) => { emit('updateForm', 'contact_info', { username: val }); },
});

const recipientStatus = computed({
  get: () => props.recipient.contragent_type === 'LEGAL_ENTITY',
  set: (val) => {
    const { company_name, ...recipient } = props.recipient;
    emit('updateForm', 'recipient', { ...recipient, contragent_type: val ? 'LEGAL_ENTITY' : 'INDIVIDUAL',
      company: val ? recipient.company ?? company_name ?? null : null, tin: val ? recipient.tin ?? null : null });
  },
});

const paymentAmount = computed(() => Number(props.paymentData?.amount_value).toFixed(2));
const paymentStatus = computed(() => props.paymentData?.status);
const paymentProvider = computed(() => t(`panel.purchases.form.payment_providers.${props.paymentData?.provider}`));
const paymentUpdated = computed(() => new Date(props.paymentData?.updated_ts * 1000));
const paymentConfirm = computed(() => props.paymentData?.confirmation_url);

const deliveryMethods = ref([{ id: 'courier', name: 'Курьер' }, { id: 'pickup_point', name: 'ПВЗ' }]);
const deliveryMethod = computed({
  get: () => props.deliveryData.to_location ? 'courier' : 'pickup_point',
  set: (val) => {
    emit('updateForm', 'delivery', val === 'courier'
      ? { delivery_point: null, to_location: props.deliveryData.to_location ?? { code: 0, address: '' } }
      : { to_location: null, delivery_point: props.deliveryData.delivery_point ?? '' });
  },
});

const updatePackage = (key: string, value: unknown) => emit('updateForm', 'delivery', {
  package: { ...props.deliveryData.package, [key]: Number(value) },
});

const rPackd = computed({
  get: () => { return props.deliveryData.reviewed_and_packed || false; },
  set: (val) => { emit('updateForm', 'delivery', { reviewed_and_packed: val }); },
});

const dConfirmed = computed({
  get: () => { return props.deliveryData.recipient_collection_confirmed || false; },
  set: (val) => { emit('updateForm', 'delivery', { recipient_collection_confirmed: val }); },
});

const deliveryLocation = computed({
  get: () => props.deliveryData.to_location?.code
    ? ({ ...props.deliveryData.to_location,
        city: props.deliveryData.city, region: props.deliveryData.region,
        name: props.deliveryData.city_name || props.deliveryData.city
          || props.cityCodes.find(city => Number(city.code) === Number(props.deliveryData.to_location.code))?.name || '' })
    : null,
  set: (val) => {
    emit('updateForm', 'delivery', { delivery_point: null,
      city: val.city, region: val.region, city_name: val.name,
      to_location: { ...props.deliveryData.to_location, code: Number(val.code), address: val.address ?? props.deliveryData.to_location?.address ?? '' } });
  },
});

const deliveryAddress = computed({
  get: () => props.deliveryData.to_location?.address ?? '',
  set: (val) => {
    emit('updateForm', 'delivery', { delivery_point: null,
      to_location: { ...props.deliveryData.to_location, address: val } });
  },
});
const deliveryPoint = computed({
  get: () => props.deliveryData.delivery_point,
  set: (val) => { emit('updateForm', 'delivery', { delivery_point: val }); },
});

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
.purchase_form{
  display: flex;
  flex-direction: column;
  gap: 20px;
  &-block{
    &__item{
      .name{
        color: $brown;
        font-weight: 600;
        margin-bottom: 10px;
        &.required{
          position: relative;
          &:after{
            position: relative;
            content: '*';
            right: -2px;
            color: red;
            font-size: 11px;
            top: -5px;
          }
        }
      }
      &.dimensions{
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      &.framed{
        border-radius: 6px;
        padding: 5px;
        border: 1px solid $light-brown;
      }
      &-first{
        margin-bottom: 10px;
      }
    }
    &__row{
      display: flex;
      gap: 10px;
    }
  }
  &-receipt{
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .receipt-row{
    display: flex;
    justify-content: space-between;
    .label{
      color: $brown;
    }
    &.small{
      .data {
        max-width: 280px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .label{
        white-space: nowrap;
      }
    }
    .data{
      color: $light-brown;
      .base_link{
        text-decoration: underline;
      }
    }
  }
  .panel_section-title{
    display: flex;
    gap: 5px;
    align-items: center;
    .refresh_button{
      margin-left: auto;
      display: flex;
      cursor: pointer;
    }
  }
}
</style>
