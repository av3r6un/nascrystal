<template>
  <article class="contacts">
    <div class="contacts_title base_title">
      {{ $t('contacts_page.title') }}
    </div>
    <div class="contacts_wrapper">
      <div class="contacts_info">
        <BulletPlate icon="phone-big" :title="$t('contacts_page.phone')">
          <div v-for="(p, idx) in settings.contacts.phones" :key="idx" class="item">
            <a :href="`tel:${p}`" class="base_link">
              {{ prettyPhone(p) }}
            </a>
          </div>
        </BulletPlate>
        <BulletPlate icon="email-big" :title="$t('contacts_page.email')">
          <div v-for="(em, idx) in settings.contacts.emails" :key="idx" class="item">
            <a :href="`mailto:${em}`" class="base_link">
              {{ em }}
            </a>
          </div>
        </BulletPlate>
        <div class="socials">
          <div v-for="(content, social) in settings.socials" :key="social" class="social_wrapper">
            <BulletPlate :icon="social" :title="$t(`contacts_page.${social}`)">
              <div class="item">
                <a :href="content.link" class="base_link">
                  {{ content.text }}
                </a>
              </div>
            </BulletPlate>
          </div>
        </div>
        <BulletPlate icon="whatsapp" :title="$t('contacts_page.whatsapp')">
          <div class="item">
            <a :href="`//wa.me/${settings.contacts.whatsapp}`" class="base_link">
              {{ prettyPhone(settings.contacts.whatsapp, 'international') }}
            </a>
          </div>
        </BulletPlate>
        <BulletPlate icon="pinpoint" :title="$t('contacts_page.address')">
          <div class="item">
            <a href="#" class="base_link">
              {{ settings.contacts.address }}
            </a>
          </div>
        </BulletPlate>
        <BulletPlate icon="clock" :title="$t('contacts_page.work_hours')">
          <div class="item">
            {{ $t('work_hours.short') }}
          </div>
        </BulletPlate>
      </div>
      <div class="contacts_feedback">
        <form ref="feebackForm" class="contacts_form" @submit.prevent="handleForm">
          <h3 class="contacts_form-title">
            {{ $t('contacts_page.feedback.title') }}
          </h3>
          <input
            v-model="feedbackForm.name"
            type="text"
            :placeholder="$t('contacts_page.feedback.name')"
            required
            class="input_wide contacts_form-input"
          >
          <input
            v-model="feedbackForm.email"
            type="email"
            :placeholder="$t('contacts_page.feedback.email')"
            required
            class="input_wide contacts_form-input"
          >
          <textarea
            v-model="feedbackForm.message"
            :placeholder="$t('contacts_page.feedback.message')"
            required
            class="input_wide-textarea contacts_form-textarea"
          />
          <button type="submit" class="btn btn_submit" :disabled="isSubmitting">
            {{ $t('contacts_page.feedback.submit') }}
          </button>
          <p class="contacts_form-status" :class="submitState">
            {{ submitMessage }}
          </p>
        </form>
      </div>
    </div>
    <div class="contacts_map">
      <iframe
        v-if="$tm('contacts_page.map.apply')"
        :src="mapIFrame"
        frameborder="0"
        height="100%"
        width="100%"
      />
      <!-- <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae17fe4b6b174ed81e6dcbde44d6cb7bf84b9066b24283e717c13e86c705653f8&amp;source=constructor" width="100%" height="100%" frameborder="0" /> -->
      <div v-else class="contacts_map-behind">
        <Icon name="nsc:pinpoint" :size="32" />
        <span class="contacts_map-text">
          Карта
        </span>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
const { t } = useI18n();
definePageMeta({
  pageKey: 'contacts',
});

const initialForm = () => reactive({
  name: '',
  email: '',
  message: '',
});
const settings = useSettings();
const prettyPhone = usePrettyPhone();

const feedbackForm = reactive(initialForm());

const isSubmitting = ref(false);
const submitState = ref<'idle' | 'success' | 'error'>('idle');
const submitMessage = ref('');
const fbForm = ref<HTMLFormElement | null>(null);

const mapIFrame = computed(() => {
  const domain = t('contacts_page.map.domain');
  const id = t('contacts_page.map.id');
  const slug = t('contacts_page.map.slug');
  return `https://${domain}${slug}${id}`;
});

const handleForm = async () => {
  if (isSubmitting.value) return;

  submitState.value = 'idle';
  isSubmitting.value = true;

  try {
    await $fetch('/internal/contact', {
      method: 'POST',
      body: feedbackForm,
    });

    submitState.value = 'success';
    fbForm.value?.reset();
    Object.assign(feedbackForm, initialForm());
  }
  catch {
    submitState.value = 'error';
  }
  finally {
    submitMessage.value = t(`contacts_page.feedback.${submitState.value}`);
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.contacts{
  padding: 112px 0;
  &_wrapper{
    margin: 64px 0;
    display: flex;
    align-items: flex-start;
    gap: 48px;
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px64;
    @media screen {
      @media (max-width: 770px) {
        flex-direction: column;
      }
      @media (max-width: 500px) {
        padding: 64px 20px;
      }
    }
  }
  &_info{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    @media (max-width: 770px) {
      width: 100%;
    }
    .base_link{
      white-space: nowrap;
    }
    .socials:has(.plate) {
      .social_wrapper{
        margin-bottom: 20px;
        &:last-child{
          margin-bottom: 0;
        }
      }
    }
  }
  &_feedback{
    flex: 1;
    padding: 32px;
    background: $light-pink;
    border-radius: 8px;
  }
  &_form-status{
    margin-top: 16px;
    font-size: 14px;
    &.success {
      color: #2e7d32;
    }
    &.error {
      color: #b71c1c;
    }
  }
  .btn_submit:disabled{
    opacity: 0.7;
    cursor: not-allowed;
  }
  &_map{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
    padding-left: 0;
    padding-right: 0;
    width: 100%;
    height: 440px;
    border-radius: 8px;
    background: $light-pink;
    @media (max-width: 1280px) {
      max-width: 95%;
    }
    &-behind{
      user-select: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: $light-brown;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
