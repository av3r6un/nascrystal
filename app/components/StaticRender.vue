<template>
  <div :class="page.slug" class="static">
    <div class="static_title base_title">
      {{ page.title }}
    </div>
    <div v-if="page.description" class="static_description">
      {{ page.description }}
    </div>
    <div v-if="hasContent" class="static_content">
      <div v-for="(block, idx) in pageBlocks" :key="idx" class="static_block">
        <div v-for="(content, name, blcid) in block" :key="blcid" :class="name">
          <div v-if="name === 'hero'" class="static_hero">
            <div v-if="imageExists(content.image)" class="static_hero-image">
              <img
                v-if="content.image"
                :src="page.hero.image"
                alt="static_hero_image"
                class="base_image"
              >
              <div v-else class="static_hero-image__blank">
                <Icon name="nsc:diamond" :size="64" />
              </div>
            </div>
            <div v-if="content.content.type === 'text'" class="static_hero-text">
              <p
                v-for="(p, txtid) in content.content.items"
                :key="txtid"
                class="static_hero-text__p"
              >
                {{ p }}
              </p>
            </div>
          </div>
          <div v-else :class="`static_${name}`">
            <div
              v-for="(b, bltid) in content.content.items"
              :key="bltid"
              :class="`static_${singleClassName(content.content.type)}`"
            >
              <component :is="getComponent(content.content.type)" v-bind="b" :index="bltid" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="static_content error">
      {{ page.error }}
      <NuxtLink to="/" class="base_link btn_submit big">
        {{ $t('error.go_home') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BulletCard from './BulletCard.vue';
import BulletPlate from './BulletPlate.vue';
import BulletStats from './BulletStats.vue';
import TitledList from './TitledList.vue';

const props = defineProps({
  page: {
    type: [Object || Array],
    required: true,
  },
});
const hasContent = computed(() => Boolean(props.page?.content));
const pageBlocks = props.page?.content?.blocks || [];
function imageExists(image: string | null) {
  return image !== null;
};
function singleClassName(contentType: string) {
  return contentType.toLowerCase().slice(0, -1);
}

const componentMap = {
  BulletStats,
  BulletCard,
  BulletPlate,
  TitledList,
} as const;

function getComponent(componentName: string) {
  return componentMap[componentName as keyof typeof componentMap] ?? 'div';
}
</script>

<style lang="scss" scoped>
.static{
  padding: 112px 0;
  &_description{
    text-align: center;
    font-size: 20px;
    text-align: center;
    color: $light-brown;
    max-width: 670px;
    margin: 0 auto;
    margin-top: 23px;
  }
  &_hero{
    display: flex;
    align-items: stretch;
    justify-content: center;
    margin: 60px 0 80px 0;
    gap: 48px;
    @media screen {
      @media (max-width: 846px) {
        flex-direction: column;
        align-items: center;
      }
    }
    &-text{
      max-width: 400px;
      flex: 1;
      width: 47%;
      @media (max-width: 846px) {
        min-width: 392px;
      }
      @media (max-width: 430px) {
        width: 90%;
        min-width: auto;
      }
      &__p{
        margin-bottom: 16px;
        color: $light-grey;
      }
    }
    &-image{
      flex: 1;
      width: 47%;
      max-width: 392px;
      border-radius: 8px;
      background: $light-pink;
      @media (max-width: 846px) {
        min-height: 294px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 392px;
      }
      @media (max-width: 430px) {
        width: 90%;
        min-width: auto;
      }
      &__blank{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        border-radius: inherit;
      }
    }
  }
  &_bullets{
    display: flex;
    justify-content: center;
    gap: 32px;
    @media (max-width: 846px) {
      flex-wrap: wrap;
    }
  }
  &_content{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px64;
    &.error{
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 55px 32px;
      .btn_submit{
        margin-top: 10px;
      }
    }
  }
  &_block{
    .simple{
      display: flex;
      justify-content: center;
    }
  }
  &_titledlis{
    &:last-child{
      .block{
        margin-bottom: 0;
      }
    }
  }
}
</style>
