<template>
  <article class="prices">
    <div class="prices_title base_title">
      {{ $t('prices_page.title') }}
    </div>
    <div class="prices_wrapper">
      <div class="prices_blocks">
        <div v-for="(b, idx) in $tm('prices_page.blocks')" :key="idx" class="prices_block">
          <div class="prices_block-title">
            {{ $rt(b.title) }}
          </div>
          <ul class="prices_block-list">
            <li v-for="(li, index) in b.bullets" :key="index" :class="`prices_block${idx}-item`">
              {{ $rt(li) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.prices{
  padding: 112px 0;
  &_wrapper{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px64;
    display: flex;
    justify-content: center;
  }
  &_block{
    border-bottom: .8px solid #E0DAD1;
    flex: 1;
    align-self: stretch;
    max-width: 700px;
    margin-bottom: 48px;
    &:last-child{
      margin-bottom: 0;
    }
    &-title{
      font-family: $title-font;
      color: $brown;
      font-size: 24px;
      font-weight: 600;
    }
    &-list{
      margin: 20px 0 32px 0;
    }
  }
}
</style>
