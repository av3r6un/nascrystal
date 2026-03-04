<template>
  <article class="catalog">
    <div class="catalog_wrapper">
      <div class="catalog_title base_title a-left">
        {{ $t('navbar.catalog') }}
      </div>
      <div v-if="!catalogItems.length" class="catalog_body go_home">
        <div class="warning">
          {{ $t('catalog.warning') }}
        </div>
        <NuxtLink to="/" class="base_link btn_submit big">
          {{ $t('error.go_home') }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
type CatalogItem = Record<string, unknown>;

definePageMeta({
  pageKey: 'catalog',
});

const { data, loading, error } = await useAsyncData<CatalogItem[]>(
  'catalog-items',
  () => $fetch('/_nuxt/catalog'),
  {
    default: () => [],
  },
);

const catalogItems = computed(() => data.value ?? []);

// const getItemKey = (item: CatalogItem, idx: number) => {
//   const key = item.id ?? item.uuid ?? item.slug;
//   return typeof key === 'string' || typeof key === 'number' ? key : idx;
// };

// const getItemTitle = (item: CatalogItem, idx: number) => {
//   const title = item.title ?? item.name;
//   if (typeof title === 'string' && title.trim()) return title.trim();
//   return `Item ${idx + 1}`;
// };

// const getItemDescription = (item: CatalogItem) => {
//   const description = item.description ?? item.details;
//   if (typeof description === 'string' && description.trim()) return description.trim();
//   return '';
// };

// const getItemPrice = (item: CatalogItem) => {
//   const price = item.price ?? item.amount;
//   if (typeof price === 'number') return `${price}`;
//   if (typeof price === 'string' && price.trim()) return price.trim();
//   return '';
// };
</script>

<style lang="scss" scoped>
.catalog{
  padding: 112px 0;
  &_wrapper{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
  }
  &_body{
    margin: 48px 0 129px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    .warning{
      text-align: center;
      margin-bottom: 15px;
      color: $light-brown;
    }
    .btn_submit.big{
      padding: 0px 14px;
      box-sizing: border-box;
    }
  }
}
</style>
