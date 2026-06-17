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
          <div class="footer_navbar-item">
            <NuxtLink to="/catalog" class="base_link">{{ t('navbar.catalog') }}</NuxtLink>
          </div>
          <div class="footer_navbar-item">
            <NuxtLink to="/about" class="base_link">{{ t('navbar.about') }}</NuxtLink>
          </div>
          <div class="footer_navbar-item">
            <NuxtLink to="/prices" class="base_link">{{ t('navbar.prices') }}</NuxtLink>
          </div>
          <div class="footer_navbar-item">
            <NuxtLink to="/contacts" class="base_link">{{ t('navbar.contacts') }}</NuxtLink>
          </div>
          <div class="footer_navbar-item">
            <NuxtLink to="/privacy-policy" class="base_link">{{ t('navbar.privacy') }}</NuxtLink>
          </div>
        </div>
        <div class="footer_contacts">
          <div class="footer_contacts-item first">
            {{ t('footer.contacts') }}
          </div>
          <div v-for="(phone, idx) in phones" :key="idx" class="footer_contacts-item">
            <a :href="`tel:${phone}`" class="base_link">{{ prettyPhone(phone) }}</a>
          </div>
          <div v-for="(em, idx) in emails" :key="idx" class="footer_contacts-item">
            <a :href="`mailto:${em}`" class="base_link">{{ prettyPhone(em) }}</a>
          </div>
          <div class="footer_contacts-item">
            <a href="" class="base_link">{{ settings.contacts.address }}</a>
          </div>
        </div>
        <div class="footer_hours">
          <div class="footer_hours-item first">
            {{ t('footer.work_hours') }}
          </div>
          <div v-for="(h, idx) in workHoursLong" :key="idx" class="footer_hours-item">
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
const settings = useSettings();
const phones = settings.value.contacts.phones;
const emails = settings.value.contacts.emails;
const prettyPhone = usePrettyPhone();
const navbar = computed(() => {
  const value = tm('navbar');
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
});
const navbarItems = computed(() => Object.keys(navbar.value).slice(1));
const contactsLong = computed(() => {
  const value = tm('contacts.long');
  return Array.isArray(value) ? value : [];
});
const workHoursLong = computed(() => {
  const value = tm('work_hours.long');
  return Array.isArray(value) ? value : [];
});
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
      font-weight: 600;
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
    font-size: 14px;
  }
}
</style>
