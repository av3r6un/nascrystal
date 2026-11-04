<template>
  <article class="modules">
    <div class="modules_body">
      <div v-if="pending && !integrations.length" class="modules_state">
        {{ t('loading') }}
      </div>
      <div v-else-if="error && !integrations.length" class="modules_state">
        {{ t('panel.stock.load_error') }}
      </div>
      <div v-else class="modules_body-content">
        <section v-for="module in integrations" :key="module.code" class="modules_section panel_section">
          <div class="modules_section-row">
            <CmsElementsCheckbox
              v-model="module.enabled"
              :title="module.name"
            />
          </div>
          <component
            :is="integrationComponents[module.code]"
            v-if="integrationComponents[module.code]"
            :module="module"
            @saved="refresh()"
          />
          <p v-else>
            Форма настройки этого модуля пока не добавлена.
          </p>
        </section>
        <p v-if="!integrations.length">
          Нет доступных модулей.
        </p>
        <section class="add_section">
          <button type="button" class="btn btn_add">
            {{ t('panel.integrations.add_module') }}
          </button>
        </section>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, type Component } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  pageKey: 'settings',
  layout: 'panel',
});

const { t } = useI18n();
const auth = useAuthStore();

type IntegrationModule = {
  code: string;
  name: string;
  enabled: boolean;
};

// cdek.vue -> cdek. Only local files from this directory can be loaded.
const componentLoaders = import.meta.glob<Component>(
  '../../components/panel/integrations/*.vue',
  { import: 'default' },
);
const integrationComponents: Record<string, Component> = Object.fromEntries(
  Object.entries(componentLoaders).map(([path, loader]) => {
    const code = path.split('/').pop()!.replace(/\.vue$/, '');
    return [code, defineAsyncComponent(loader)];
  }),
);

const ensureAuthorized = async () => {
  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};

const { data, pending, error, refresh } = await useAsyncData<IntegrationModule[]>(
  'panel-modules-page',
  async () => {
    await ensureAuthorized();
    const response = await $fetch<IntegrationModule[]>('/internal/integrations/modules', {
      headers: auth.authHeader,
    });
    return response;
  },
  // Nuxt 4 uses shallow data by default; v-model changes nested module fields.
  { server: false, deep: true, default: () => ([]) },
);

const integrations = computed(() => data.value ?? []);
</script>

<style lang="scss" scoped>
.add_section{
  margin-top: 15px;
}
</style>
