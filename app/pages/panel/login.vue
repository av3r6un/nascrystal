<template>
  <article class="login">
    <div class="login_wrapper">
      <div class="login_title base_title">
        Авторизация
      </div>
      <form ref="lForm" class="login_form" @submit.prevent="handleForm">
        <input
          v-model="loginForm.email"
          autocomplete="off"
          required
          :placeholder="t('login_page.placeholders.email')"
          autofocus
          type="email"
          class="input_wide"
        >
        <input
          v-model="loginForm.password"
          autocomplete="off"
          required
          :placeholder="t('login_page.placeholders.password')"
          type="password"
          class="input_wide"
        >
        <button type="submit" class="btn btn_submit" :disabled="isSubmitting">
          {{ t('login_page.submit') }}
        </button>
        <p class="contacts_form-status" :class="submitState">
          {{ submitMessage }}
        </p>
      </form>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  pageKey: 'login',
  layout: 'panel',
});

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const initialForm = () => ({
  email: '',
  password: '',
});

const loginForm = reactive(initialForm());
const lForm = ref<HTMLFormElement | null>(null);

const isSubmitting = ref(false);
const submitState = ref<'idle' | 'success' | 'error'>('idle');
const submitMessage = ref('');

if (import.meta.client) {
  const ok = await auth.ensureValidAccessToken();
  if (ok) {
    await router.push('/panel');
  }
}

const handleForm = async () => {
  if (isSubmitting.value) return;

  submitState.value = 'idle';
  isSubmitting.value = true;

  try {
    await auth.login(loginForm.email, loginForm.password);

    submitState.value = 'success';
    lForm.value?.reset();
    Object.assign(loginForm, initialForm());
    await router.push('/panel');
  }
  catch {
    submitState.value = 'error';
  }
  finally {
    submitMessage.value = t(`login_page.${submitState.value}`);
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login{
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px);
  @media screen {
    @media (max-width: 472px) {
      max-width: 95%;
      margin: 0 auto;
    }
  }
  &_wrapper{
    border-radius: 8px;
    background: $light-pink;
    padding: 32px;
    box-sizing: border-box;
    max-width: 450px;
  }
  &_title{
    margin-bottom: 10px;
  }
}
</style>
