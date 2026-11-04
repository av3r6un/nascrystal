<template>
  <form class="module_body" @submit.prevent="save">
    <p v-if="pending">
      Загрузка настроек СДЭК…
    </p>
    <p v-else-if="error" role="alert">
      Не удалось загрузить настройки СДЭК.
    </p>
    <div class="module_item">
      <div class="module_item-title required">
        {{ t('panel.integrations.cdek.auth.title') }}
      </div>
      <div class="module_item-row">
        <CmsElementsInput
          v-model="finalForm.account"
          type="password"
          :required="!data?.account_configured"
          placeholder="panel.integrations.cdek.auth.account_placeholder"
        />
        <CmsElementsInput
          v-model="finalForm.secure_password"
          type="password"
          :required="!data?.secure_password_configured"
          placeholder="panel.integrations.cdek.auth.password_placeholder"
        />
      </div>
      <div class="module_item-caption">
        <p class="caption">
          {{ t('panel.integrations.cdek.auth.caption') }}
        </p>
      </div>
    </div>
    <div class="module_item">
      <div class="module_item-title">
        {{ t('panel.integrations.cdek.contragent.title') }}
      </div>
      <PanelSelection v-model="finalForm.sender.contragent_type" :options="contragentTypes" />
      <div class="module_item-row company_info">
        <CmsElementsInput
          v-if="isLegalContragent"
          v-model="finalForm.sender.company"
          required
          name="panel.integrations.cdek.company.title"
          placeholder="panel.integrations.cdek.company.placeholder"
        />
        <CmsElementsInput
          v-if="isLegalContragent"
          v-model="finalForm.sender.tin"
          required
          name="panel.integrations.cdek.tin.title"
          placeholder="panel.integrations.cdek.tin.placeholder"
        />
      </div>
    </div>
    <div class="module_item">
      <div class="module_item-row">
        <CmsElementsInput
          v-model="finalForm.shipment_point"
          name="panel.integrations.cdek.shipment_point.title"
          placeholder="panel.integrations.cdek.shipment_point.placeholder"
        />
        <CmsElementsInput
          v-model="finalForm.from_location.code"
          name="panel.integrations.cdek.from_location.code.title"
          placeholder="panel.integrations.cdek.from_location.code.placeholder"
        />
        <CmsElementsInput
          v-model="finalForm.from_location.address"
          name="panel.integrations.cdek.from_location.address.title"
          placeholder="panel.integrations.cdek.from_location.address.placeholder"
        />
      </div>
      <div class="module_item-row">
        <CmsElementsInput
          v-model="finalForm.sender.name"
          name="panel.integrations.cdek.sender.name.title"
          placeholder="panel.integrations.cdek.sender.name.placeholder"
        />
        <CmsElementsPhone
          v-model="finalForm.sender.phones[0].number"
          name="panel.integrations.cdek.sender.phone.title"
          placeholder="panel.integrations.cdek.sender.phone.placeholder"
        />
        <CmsElementsInput
          v-model="finalForm.sender.email"
          name="panel.integrations.cdek.sender.email.title"
          placeholder="panel.integrations.cdek.sender.email.placeholder"
        />
      </div>
    </div>
    <p v-if="message" role="status" class="module_message" :class="checkStatus">
      {{ t(message) }}
    </p>
    <button type="submit" class="btn btn_submit" :disabled="pending || saving || !!error">
      {{ saving ? t('panel.integrations.conn_check') : t('panel.submit') }}
    </button>
  </form>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth';

const { t } = useI18n();
const props = defineProps<{ module: { enabled: boolean } }>();
const emit = defineEmits(['saved']);
const saving = ref(false);
const message = ref('');
const checkStatus = ref('');

const auth = useAuthStore();

const ensureAuthorized = async () => {
  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};

const emptyForm = () => ({
  account: '',
  secure_password: '',
  from_location: {
    code: '',
    address: '',
  },
  sender: {
    name: '',
    phones: [{ number: '' }],
    email: '',
    contragent_type: 'INDIVIDUAL',
    company: '',
    tin: '',
  },
  shipment_point: '',
});

const finalForm = ref(emptyForm());

const contragentTypes = ref([
  { id: 'INDIVIDUAL', name: 'Физическое лицо' },
  { id: 'LEGAL_ENTITY', name: 'Юридическое лицо' },
]);

const isLegalContragent = computed(() => finalForm.value?.sender.contragent_type === 'LEGAL_ENTITY');

type ModuleConfig = {
  account_configured: boolean;
  secure_password_configured: boolean;
  config: {
    from_location?: Partial<Omit<ReturnType<typeof emptyForm>['from_location'], 'code'>> & { code: number } | null;
    sender?: Partial<ReturnType<typeof emptyForm>['sender']> | null;
    shipment_point?: string | null;
  };
};

const { data, pending, error } = await useAsyncData<ModuleConfig>(
  'panel-module-cdek',
  async () => {
    await ensureAuthorized();
    return await $fetch<ModuleConfig>('/internal/integrations/cdek', {
      headers: auth.authHeader,
    });
  },
  { server: false },
);

watch(data, (module) => {
  if (!module) return;
  const config = module.config;
  const defaults = emptyForm();
  finalForm.value = {
    ...defaults,
    ...config,
    account: '',
    secure_password: '',
    from_location: { ...defaults.from_location, ...config.from_location, code: String(config.from_location?.code ?? '') },
    sender: {
      ...defaults.sender,
      ...config.sender,
      phones: config.sender?.phones?.length ? config.sender.phones.map(phone => ({ ...phone })) : defaults.sender.phones,
    },
    shipment_point: config.shipment_point ?? '',
  };
}, { immediate: true });

function normalizeStrings(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [
    key, typeof value === 'string' ? value.trim() || null : value,
  ]));
}

async function save() {
  if (saving.value) return;
  saving.value = true;
  message.value = '';
  try {
    await ensureAuthorized();
    const { from_location, sender, ...config } = finalForm.value;
    const phones = sender.phones.map(phone => ({ ...phone, number: phone.number.trim() }));
    const hasSender = sender.name || sender.email || sender.company || sender.tin || phones.some(phone => phone.number);
    data.value = await $fetch<ModuleConfig>('/internal/integrations/cdek', {
      method: 'PUT', headers: auth.authHeader,
      body: {
        enabled: props.module.enabled,
        config: {
          ...normalizeStrings(config),
          from_location: from_location.code.trim()
            ? { ...normalizeStrings(from_location), code: Number(from_location.code) }
            : null,
          sender: hasSender ? { ...normalizeStrings(sender), phones } : null,
        },
      },
    });
    message.value = 'panel.integrations.conn_success';
    checkStatus.value = 'success';
    emit('saved');
  }
  catch {
    message.value = 'panel.integrations.conn_error';
    checkStatus.value = 'error';
  }
  finally {
    saving.value = false;
    setTimeout(() => {
      message.value = '';
      checkStatus.value = '';
    }, 4000);
  }
}
</script>

<style lang="scss" scoped>
.module{
  &_body{
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  &_item{
    &-title{
      font-family: $text-font;
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
    &-row{
      display: flex;
      gap: 20px;
      justify-content: space-between;
      margin-bottom: 10px;
      @media screen {
        @media (max-width: 830px) {
          flex-direction: column;
          gap: 10px;
        }
      }
      .input{
        width: 100%;
      }
      &.company_info{
        margin-top: 10px;
        margin-bottom: 0;
      }
      /* 830px */
    }
    .caption{
      color: $light-brown;
      font-size: 14px;
    }
  }
  &_message{
    text-align: center;
    &.success{
      color: $light-green;
    }
    &.error{
      color: $light-red;
    }
  }
}
</style>
