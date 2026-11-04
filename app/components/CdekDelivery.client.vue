<template>
  <div class="cdek-delivery">
    <p v-if="!apiKey" role="status">
      Карта СДЭК временно недоступна. Попробуйте оформить доставку позже.
    </p>
    <template v-else>
      <p v-if="loading" role="status">
        Загружаем карту СДЭК…
      </p>
      <p v-if="!geocoderAvailable" role="status">
        Поиск адресов и доставка до двери временно недоступны: геокодер не настроен.
      </p>
      <div :id="mapId" class="cdek-delivery_map" />
      <p v-if="checking" role="status">
        Проверяем адрес и рассчитываем доставку…
      </p>
      <p v-if="error" role="alert">
        {{ error }}
      </p>
      <button v-if="error" type="button" class="base_link" @click="mountWidget">
        Повторить
      </button>
    </template>
    <template v-if="modelValue">
      <p class="data_address">
        {{ modelValue.data.address }}
      </p>
      <p class="data_cost">
        Доставка ≈ {{ modelValue.data.delivery_cost }} ₽
      </p>
    </template>
    <p class="cdek-delivery_caption">
      Расчёт предварительный. доставка оплачивается отдельно:
      через CDEK ID или при получении. Точная стоимость зависит от упакованной посылки.
    </p>
  </div>
</template>

<script setup lang="ts">
import type Widget from '@cdek-it/widget';

const props = defineProps({
  modelValue: { type: Object, default: null },
  quantity: { type: Number, required: true },
});
const emit = defineEmits(['update:modelValue']);
const apiKey = useRuntimeConfig().public.yandexMapsApiKey;
const mapId = 'cdek-' + useId().replace(/[^a-z0-9-]/gi, '');
const loading = ref(false);
const checking = ref(false);
const geocoderAvailable = ref(true);
const error = ref('');
let widget: Widget | undefined;
let generation = 0;
let selectionRequest = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

const mountWidget = async () => {
  const current = ++generation;
  ++selectionRequest;
  clearTimeout(timer);
  widget?.destroy();
  widget = undefined;
  emit('update:modelValue', null);
  checking.value = false;
  error.value = '';
  if (!apiKey || !props.quantity) return;
  loading.value = true;
  try {
    const [module, config] = await Promise.all([
      import('@cdek-it/widget'),
      $fetch<{ package: Record<string, number>; geocoderConfigured: boolean }>('/internal/delivery/cdek/config', {
        query: { quantity: props.quantity },
      }),
    ]);
    if (current !== generation) return;
    geocoderAvailable.value = config.geocoderConfigured;
    const onChoose: NonNullable<ConstructorParameters<typeof Widget>[0]['onChoose']> = async (type, _tariff, target) => {
      const request = ++selectionRequest;
      emit('update:modelValue', null);
      checking.value = true;
      error.value = '';
      try {
        const destination = type === 'office' && 'code' in target
          ? { delivery_point: target.code }
          : 'position' in target
            ? { address: target.formatted, longitude: target.position[0], latitude: target.position[1] }
            : null;
        if (!destination) throw new Error('Invalid destination');
        const result = await $fetch<{ module: string; data: Record<string, unknown> }>('/internal/delivery/cdek/selection', {
          method: 'POST', body: { quantity: props.quantity, ...destination },
        });
        if (current !== generation || request !== selectionRequest) return;
        const { tariff_code, ...delivery } = result.data;
        emit('update:modelValue', {
          ...result,
          data: { ...delivery, selected_tariff_code: tariff_code, address: 'address' in target ? target.address : target.formatted,
            city_name: result.data.city_name || ('city' in target ? target.city : '') },
        });
      }
      catch (failure) {
        if (current === generation && request === selectionRequest) {
          const message = (failure as { data?: { data?: { message?: string } } }).data?.data?.message;
          error.value = message || 'Не удалось проверить адрес или рассчитать доставку. Выберите другой пункт или повторите попытку.';
        }
      }
      finally {
        if (current === generation && request === selectionRequest) checking.value = false;
      }
    };
    widget = new module.default({
      apiKey, root: mapId, servicePath: '/internal/delivery/cdek/widget',
      from: null, goods: [config.package], defaultLocation: [37.6176, 55.7558],
      canChoose: true, onChoose,
      onReady: () => {
        if (current !== generation) return;
        clearTimeout(timer);
        loading.value = false;
      },
    } as ConstructorParameters<typeof Widget>[0]);
    // Widget 4.1.0 has no separate geocoder option; keep this version-specific override here.
    (widget as unknown as { yandexApi: { geocodeSrc: string } }).yandexApi.geocodeSrc = '/internal/delivery/cdek/geocode';
    timer = setTimeout(() => {
      if (current !== generation) return;
      loading.value = false;
      error.value = 'Карта СДЭК не загрузилась. Повторите попытку.';
    }, 30000);
  }
  catch {
    if (current !== generation) return;
    loading.value = false;
    error.value = 'Не удалось загрузить карту СДЭК. Повторите попытку.';
  }
};

onMounted(mountWidget);
watch(() => props.quantity, mountWidget);
onBeforeUnmount(() => {
  ++generation;
  ++selectionRequest;
  clearTimeout(timer);
  widget?.destroy();
});
</script>

<style scoped lang="scss">
.cdek-delivery {
  display: grid;
  gap: 12px;
  &_map {
    width: 100%;
    height: 600px;
    min-width: 0;
  }
  &_caption {
    font-size: 13px;
    color: $light-brown;
  }
  .data{
    &_address{
      color: $brown;
      margin-top: 24px;
    }
    &_cost{
      color: $brown;
      margin-top: -5px;
    }
  }
}
</style>
