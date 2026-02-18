<template>
  <article class="contacts">
    <div class="contacts_title base_title">
      {{ $t('contacts_page.title') }}
    </div>
    <div class="contacts_wrapper">
      <div class="contacts_info">
        <BulletPlate
          icon="phone-big"
          :title="$t('contacts_page.phone')"
          :caption="$t('contacts.phone')"
          class="contacts_info-plate"
        />
        <BulletPlate
          icon="email-big"
          :title="$t('contacts_page.email')"
          :caption="$t('contacts.email')"
          class="contacts_info-plate"
        />
        <BulletPlate
          icon="pinpoint"
          :title="$t('contacts_page.address')"
          :caption="$t('contacts.address')"
          class="contacts_info-plate"
        />
        <BulletPlate
          icon="clock"
          :title="$t('contacts_page.work_hours')"
          :caption="$t('work_hours.short')"
          class="contacts_info-plate"
        />
      </div>
      <div class="contacts_feedback">
        <form class="contacts_form" @submit.prevent="handleForm">
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
          <button type="submit" class="btn btn_submit">
            {{ $t('contacts_page.feedback.submit') }}
          </button>
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

<script>
export default {
  name: 'Contacts',
  data() {
    return {
      feedbackForm: {
        name: null,
        email: null,
        message: null,
      },
    };
  },
  computed: {
    mapIFrame() {
      const domain = this.$t('contacts_page.map.domain');
      const id = this.$t('contacts_page.map.id');
      const slug = this.$t('contacts_page.map.slug');
      return `https://${domain}${slug}${id}`;
    },
  },
  methods: {
    handleForm() {},
  },
};
</script>

<style lang="scss" scoped>
.contacts{
  padding: 112px 0;
  &_wrapper{
    margin: 64px 0;
    display: flex;
    align-items: center;
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
  }
  &_feedback{
    flex: 1;
    padding: 32px;
    background: $light-pink;
    border-radius: 8px;
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
