<template>
  <header class="header">
    <div class="header_pre">
      <div class="header_pre-wrapper">
        <div class="header_pre-item">
          <Icon name="nsc:phone" :size="15" />
          <a :href="`tel:${$t('contacts.phone')}`" class="base_link">
            {{ $t('contacts.phone') }}
          </a>
        </div>
        <div class="header_pre-item email">
          <Icon name="nsc:email" :size="15" />
          <a :href="`mailto:${$t('contacts.email')}`" class="base_link">
            {{ $t('contacts.email') }}
          </a>
        </div>
        <div class="header_pre-item">
          {{ $t('work_hours.short') }}
        </div>
      </div>
    </div>
    <div class="header_nav">
      <div class="header_nav-item logo">
        <NuxtLink to="/" class="base_link">
          NAS Crystal
        </NuxtLink>
      </div>
      <div class="header_navbar">
        <div class="header_navbar-item home">
          <NuxtLink to="/" class="base_link">
            {{ $t('navbar.home') }}
          </NuxtLink>
        </div>
        <div class="header_navbar-item">
          <NuxtLink to="/catalog" class="base_link">
            {{ $t('navbar.catalog') }}
          </NuxtLink>
        </div>
        <div class="header_navbar-item">
          <NuxtLink to="/about" class="base_link">
            {{ $t('navbar.about') }}
          </NuxtLink>
        </div>
        <div class="header_navbar-item">
          <NuxtLink to="/prices" class="base_link">
            {{ $t('navbar.prices') }}
          </NuxtLink>
        </div>
        <div class="header_navbar-item">
          <NuxtLink to="/contacts" class="base_link">
            {{ $t('navbar.contacts') }}
          </NuxtLink>
        </div>
      </div>
      <div class="header_nav-item cart">
        <NuxtLink to="/" class="base_link">
          <Icon name="nsc:cart" :size="24" />
        </NuxtLink>
      </div>
      <div class="header_nav-item burger">
        <BurgerMenu />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.header{
  position: fixed;
  z-index: 5;
  background: $white;
  width: 100%;
  top: 0;
  &_pre{
    border-bottom: 0.8px solid $semi-grey;
    font-size: 14px;
    &-wrapper{
      max-width: $wrapper-width;
      margin: $wrapper-pos;
      padding: $wrapper-px0;
      display: flex;
      align-items: center;
      gap: 20px;
      height: 32px;
    }
    &-item{
      color: $light-grey;
      font-weight: 300;
      display: flex;
      align-items: center;
      .m-icon{
        margin-right: 7px;
      }
      &:last-child{
        margin-left: auto;
      }
      &.email{
        @media screen {
          @media (max-width: 560px) {
            display: none;
          }
        }
      }
    }
  }
  &_nav{
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
    height: 64px;
    .cart{
      margin-left: auto;
    }
    &-item{
      &.logo{
        font-family: $title-font;
        font-weight: 300;
        font-size: 24px;
        text-transform: none;
        margin-right: auto;
        color: $brown;
      }
    }
  }
  &_navbar{
    display: flex;
    align-items: center;
    gap: 32px;
    @media screen {
      @media (max-width: 768px) {
        display: none;
      }
    }
    &-item{
      &.home{
        @media (max-width: 890px) {
          display: none;
        }
      }
      font-family: $text-font;
      font-weight: 100;
      font-size: 18px;
      text-transform: uppercase;
      color: $light-brown;
      @media (max-width: 768px) {
        font-size: 16px;
      }
    }
  }
}
</style>
