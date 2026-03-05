<template>
  <article class="dashboard">
    <div class="dashboard_title base_title">
      {{ t('panel.dashboard.title') }}
    </div>
    <div class="dashboard_body">
      <div class="dashboard_info">
        <PanelStat title="Товаров к каталоге" icon="box" :number="0" />
        <PanelStat title="Заказов за месяц" icon="shopping-cart" :number="0" />
        <PanelStat title="Последнее обновление" icon="clock" :date="now" />
      </div>
      <div class="dashboard_row">
        <div class="dashboard_history" />
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
const { t } = useI18n();

const now = new Date().getTime() / 1000;
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
