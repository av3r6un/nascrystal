<template>
  <article class="about">
    <div class="about_title base_title">
      {{ $t('about_page.title') }}
    </div>
    <div class="about_slogan">
      {{ $t('about_page.slogan') }}
    </div>
    <div class="about_hero">
      <div class="about_hero-image">
        <img
          v-if="$te('about_page.image')"
          :src="$t('about_page.image')"
          class="base_link"
        >
        <div v-else class="about_hero-image__blank">
          <Icon name="nsc:diamond" :size="64" />
        </div>
      </div>
      <div class="about_hero-text">
        <p v-for="(p, idx) in $tm('about_page.text')" :key="idx" class="about_hero-text__p">
          {{ $rt(p) }}
        </p>
      </div>
    </div>
    <div class="about_stats">
      <div v-for="(b, idx) in $tm('about_page.stats')" :key="idx" class="about_stats-stat">
        <BulletStats :title="$rt(b.number)" :caption="$rt(b.text)" />
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.about{
  padding: 112px 0;
  &_slogan{
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
  &_stats{
    display: flex;
    justify-content: center;
    gap: 32px;
    @media (max-width: 846px) {
      flex-wrap: wrap;
    }
  }
}
</style>
