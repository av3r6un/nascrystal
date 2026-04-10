<template>
  <article class="dashboard">
    <div class="dashboard_title base_title">
      {{ t('panel.dashboard.title') }}
    </div>
    <div class="dashboard_body">
      <div class="dashboard_info">
        <PanelStat title="Товаров к каталоге" icon="box" :number="0" />
        <PanelStat title="Заказов за месяц" icon="shopping-cart" :number="0" />
        <PanelStat title="Последнее обновление" icon="clock" :date="lastUpdateTs ?? undefined" />
      </div>
      <div class="dashboard_row">
        <div class="dashboard_history panel_section">
          <div class="dashboard_history-title">
            {{ t('panel.dashboard.changes') }}
          </div>
          <div v-if="pending" class="dashboard_history-state">
            Loading...
          </div>
          <div v-else-if="error" class="dashboard_history-state">
            Failed to load changes
          </div>
          <div v-else-if="changes.length < 1" class="dashboard_history-state">
            {{ t('panel.dashboard.changes_empty') }}
          </div>
          <div v-else class="dashboard_history-list">
            <div v-for="change in changes" :key="change.id" class="dashboard_history-item">
              <div class="dashboard_history-event">
                {{ t(`changes.${change.event_type}`) }}
                <span
                  class="muted"
                  :title="smoothPayload(change.payload)"
                >
                  «{{ smoothPayload(change.payload) }}»
                </span>
              </div>
              <div class="dashboard_history-ts">
                {{ $rd(change.created_ts) }}
              </div>
            </div>
          </div>
        </div>
        <div class="dashboard_actions">
          <div class="dashboard_actions-wrapper">
            <div class="dashboard_actions-title">
              {{ t('panel.dashboard.quick_actions') }}
            </div>
            <div class="dashboard_actions-body">
              <div class="dashboard_actions-action">
                <NuxtLink to="/panel/stock" class="base_link">
                  <Icon name="nsc:lightning" :size="24" />
                  {{ t('panel.dashboard.add_stock') }}
                </NuxtLink>
              </div>
              <div class="dashboard_actions-action">
                <NuxtLink to="/panel/purchases" class="base_link">
                  <Icon name="nsc:lightning" :size="24" />
                  {{ t('panel.dashboard.watch_purchases') }}
                </NuxtLink>
              </div>
              <div class="dashboard_actions-action">
                <NuxtLink to="/panel/home" class="base_link">
                  <Icon name="nsc:lightning" :size="24" />
                  {{ t('panel.dashboard.edit_main_page') }}
                </NuxtLink>
              </div>
              <div class="dashboard_actions-action">
                <NuxtLink to="/panel/settings" class="base_link">
                  <Icon name="nsc:lightning" :size="24" />
                  {{ t('panel.dashboard.change_contacts') }}
                </NuxtLink>
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
  pageKey: 'dashboard',
  layout: 'panel',
});
const { t, locale } = useI18n();
const auth = useAuthStore();

type ChangeEventItem = {
  id: number;
  action: string;
  event_type: string;
  payload: Record<string, unknown>;
  actor_uid: string | null;
  created: string;
  created_ts: number;
};

type ChangeEventsResponse = {
  items: ChangeEventItem[];
};

type LastUpdateResponse = {
  last_update_ts: number | null;
};

const { data, pending, error } = await useAsyncData<ChangeEventsResponse>(
  'panel-dashboard-changes',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    return await $fetch('/internal/changes', {
      method: 'GET',
      params: {
        locale: locale.value,
        limit: 5,
      },
      headers: auth.authHeader,
    });
  },
  {
    server: false,
    watch: [locale],
    default: () => ({
      items: [],
    }),
  },
);

const { data: lastUpdateData } = await useAsyncData<LastUpdateResponse>(
  'panel-dashboard-last-update',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    return await $fetch('/internal/changes/last_update', {
      method: 'GET',
      headers: auth.authHeader,
    });
  },
  {
    server: false,
    default: () => ({
      last_update_ts: null,
    }),
  },
);

const changes = computed(() => Array.isArray(data.value?.items) ? data.value.items : []);
const lastUpdateTs = computed(() => {
  const value = lastUpdateData.value?.last_update_ts;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
});
const smoothPayload = (payload: object) => {
  let res = '';
  Object.entries(payload).forEach(([v, k]) => {
    if (v == 'key') {
      res = t(`panel.settings.${k}`);
    }
    else {
      res = k;
    }
  });
  return res;
};
const { $rd } = useNuxtApp();
</script>

<style lang="scss" scoped>
.dashboard{
  &_info{
    display: flex;
    align-items: center;
    width: 100%;
    gap: 12px;
    @media (max-width: 705px) {
      flex-wrap: wrap;
    }
    @media (max-width: 505px) {
      justify-content: center;
    }
  }
  &_row{
    margin-top: 32px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(240px, 1fr);
    gap: 24px;
    align-items: start;
    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  }
  &_history{
    &-title{
      color: $brown;
      font-size: 20px;
      font-family: $title-font;
      font-weight: 600;
    }
    &-state{
      color: $light-brown;
    }
    &-list{
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    &-item{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-radius: 8px;
      background: $light-pink;
      cursor: default;
    }
    &-event{
      color: $brown;
      font-weight: 500;
      white-space: nowrap;
      display: flex;
      gap: 8px;
      font-size: 14px;
      .muted{
        display: block;
        white-space: nowrap;
        max-width: 160px;
        overflow: hidden;
        color: $light-brown;
        text-overflow: ellipsis;
      }
    }
    &-ts{
      color: $light-brown;
      font-size: 14px;
      white-space: nowrap;
    }
  }
  &_actions{
    &-wrapper{
      padding: 24px;
      background: $light-pink;
      border-radius: 8px;
      border: 1px solid $semi-grey;
    }
    &-title{
      color: $brown;
      font-size: 20px;
      font-family: $title-font;
      font-weight: 600;
      margin-bottom: 20px;
    }
    &-body{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: repeat(2, auto);
      gap: 12px;
      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
      }
    }
    &-action{
      border: 1px solid $semi-grey;
      padding: 15px 17px;
      border-radius: 8px;
      .base_link{
        display: flex;
        align-items: center;
        gap: 10px;
        color: $brown;
        white-space: nowrap;
      }
    }
  }
}
</style>
