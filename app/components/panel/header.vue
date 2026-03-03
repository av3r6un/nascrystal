<template>
  <div class="header">
    <div class="header_breadcrumbs">
      Панель управления
    </div>
    <div class="header_actions">
      <div class="header_notifications">
        <Icon name="nsc:notifications" :size="24" />
      </div>
      <div class="header_gohome">
        <NuxtLink to="/" class="base_link" :title="t('error.go_home')">
          <Icon name="nsc:external" :size="24" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.header{
  max-height: 66px;
  padding: 19px 32px;
  display: flex;
  color: $light-brown;
  align-items: center;
  background: $light-pink;
  border-bottom: 0.8px solid $semi-grey;
  &_actions{
    margin-left: auto;
    display: flex;
    gap: 20px;
  }
}
</style>
