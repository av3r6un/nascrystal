<template>
  <div class="navbar">
    <div class="navbar_logo">
      <div class="navbar_logo-wrapper">
        <div class="logo">
          <img src="/img/favicon-64.png" alt="logo">
        </div>
        <div class="navbar_logo-text">
          <div class="title">
            Nas Crystal
          </div>
          <div class="caption">
            Админ-Панель
          </div>
        </div>
      </div>
    </div>
    <div class="navbar_nav">
      <div class="navbar_item">
        <NuxtLink to="/panel" class="base_link">
          <Icon name="nsc:dashgrid" :size="24" />
          <span class="navbar_item-text">
            {{ t('panel.navbar.dashboard') }}
          </span>
        </NuxtLink>
      </div>
      <div class="navbar_item">
        <NuxtLink to="/panel/home" class="base_link">
          <Icon name="nsc:home" :size="24" />
          <span class="navbar_item-text">
            {{ t('panel.navbar.main_page') }}
          </span>
        </NuxtLink>
      </div>
      <div class="navbar_item">
        <NuxtLink to="/panel/static" class="base_link">
          <Icon name="nsc:pages" :size="24" />
          <span class="navbar_item-text">
            {{ t('panel.navbar.static_pages') }}
          </span>
        </NuxtLink>
      </div>
      <div class="navbar_item">
        <NuxtLink to="/panel/catalog" class="base_link">
          <Icon name="nsc:grid" :size="24" />
          <span class="navbar_item-text">
            {{ t('panel.navbar.catalog') }}
          </span>
        </NuxtLink>
      </div>
      <div class="navbar_item">
        <NuxtLink to="/panel/stock" class="base_link">
          <Icon name="nsc:box" :size="24" />
          <span class="navbar_item-text">
            {{ t('panel.navbar.stock') }}
          </span>
        </NuxtLink>
      </div>
      <div class="navbar_item">
        <NuxtLink to="/panel/purchases" class="base_link">
          <Icon name="nsc:shopping-cart" :size="24" />
          <span class="navbar_item-text">
            {{ t('panel.navbar.purchases') }}
          </span>
        </NuxtLink>
      </div>
      <div class="navbar_item">
        <NuxtLink to="/panel/settings" class="base_link">
          <Icon name="nsc:cog" :size="24" />
          <span class="navbar_item-text">
            {{ t('panel.navbar.settings') }}
          </span>
        </NuxtLink>
      </div>
      <div class="navbar_item last">
        <div
          class="navbar_item-user"
          title="Выйти из аккаунта"
          @click="handleLogout"
        >
          <div class="navbar_item-user__avatar">
            <Icon name="nsc:user" :size="24" />
          </div>
          <span class="navbar_item-text">
            {{ t('panel.navbar.user') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const handleLogout = async () => {
  auth.logout();
  await router.push('/panel/login');
};
</script>

<style lang="scss" scoped>
.navbar{
  height: 100%;
  background: $light-pink;
  border-right: 0.8px solid $semi-grey;
  &_logo{
    &-wrapper{
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      max-height: 65px;
    }
    border-bottom: 0.8px solid $semi-grey;
    .logo{
      display: flex;
      object-fit: contain;
      img{
        width: 48px;
      }
    }
    &-text{
      width: auto;
      transition: all .4s ease;
      white-space: nowrap;
      .title{
        font-family: $title-font;
        font-size: 22px;
        font-weight: bold;
        color: $brown;
        opacity: 1;
        @media (max-width: 768px) {
          opacity: 0;
        }
      }
      .caption{
        color: $light-brown;
        font-size: 12px;
        opacity: 1;
        @media (max-width: 768px) {
          opacity: 0;
        }
      }
      @media (max-width: 768px) {
        width: 0;
      }
    }
  }
  &_nav{
    height: calc(100% - 65px);
    display: flex;
    padding: 15px;
    flex-direction: column;
  }
  &_item{
    border-radius: 8px;
    color: $light-brown;
    white-space: nowrap;
    &:has(.router-link-exact-active) {
      background: $pinky;
    }
    .base_link{
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      font-size: 14px;
      border-radius: inherit;
      svg {
        min-width: 24px;
      }
    }
    &-user{
      display: flex;
      align-items: center;
      cursor: pointer;
      gap: 8px;
      @media (max-width: 768px) {
        justify-content: center;
      }
      &__avatar{
        height: 32px;
        width: 32px;
        border-radius: 50%;
        background: $pinky;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    &.last{
      margin-top: auto;
    }
    &-text{
      opacity: 1;
      width: auto;
      transition: all .2s ease;
      @media (max-width: 768px) {
        pointer-events: none;
        opacity: 0;
        width: 0;
      }
    }
  }
}
</style>
