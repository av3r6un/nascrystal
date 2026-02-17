<template>
  <footer class="footer">
    <div class="footer_wrapper">
      <div class="footer_menu">
        <div class="footer_info">
          <div class="footer_info-title">
            {{ t('footer.title') }}
          </div>
          <div class="footer_info-description">
            {{ t('footer.description') }}
          </div>
        </div>
        <div class="footer_navbar">
          <div class="footer_navbar-item first">
            {{ t('footer.navbar') }}
          </div>
          <div v-for="(n, idx) in navbarItems" :key="idx" class="footer_navbar-item">
            <NuxtLink class="base_link" :to="`/${rt(n)}`">{{ t(`navbar.${rt(n)}`) }}</NuxtLink>
          </div>
        </div>
        <div class="footer_contacts">
          <div class="footer_contacts-item first">
            {{ t('footer.contacts') }}
          </div>
          <div v-for="(c, idx) in tm('contacts.long')" :key="idx" class="footer_contacts-item">
            {{ rt(c) }}
          </div>
        </div>
        <div class="footer_hours">
          <div class="footer_hours-item first">
            {{ t('footer.work_hours') }}
          </div>
          <div v-for="(h, idx) in tm('work_hours.long')" :key="idx" class="footer_hours-item">
            {{ rt(h) }}
          </div>
        </div>
      </div>
      <div class="footer_copy">
        {{ t('footer.copyright') }}
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const { t, tm, rt } = useI18n();
const navbarItems = computed(() => Object.keys(tm('navbar')).slice(1));
</script>

<style lang="scss" scoped>
.footer{
  background: $pinky;
  &_wrapper{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px64;
  }
  &_menu{
    display: flex;
    gap: 40px;
    justify-content: space-between;
    font-weight: 300;
    font-size: 14px;
    color: $light-brown;
    @media screen {
      @media (max-width: 766px) {
        flex-basis: 275px;
        flex-wrap: wrap;
      }
      @media (max-width: 666px) {
        flex-direction: column;
        align-items: center;

      }
    }
  }
  &_info{
    &-title{
      font-family: $title-font;
      color: $brown;
      font-size: 20px;
      margin-bottom: 15px;
      font-weight: 500;
    }
    &-description{
      max-width: 274px;
      font-size: 14px;
      color: $light-brown;
    }
  }
  &_navbar,
  &_contacts,
  &_hours{
    @media (max-width: 766px) {
      flex-basis: 275px;
    }
    @media (max-width: 666px) {
      flex-basis: auto;
      width: 275px;
    }
    &-item{
      margin-bottom: 10px;
    }
  }
  .first{
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  &_copy{
    text-align: center;
    margin-top: 48px;
    color: $light-brown;
    font-weight: 100;
    font-size: 14px;
  }
}
</style>
