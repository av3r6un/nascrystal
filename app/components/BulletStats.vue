<template>
  <div class="bullet">
    <div class="bullet_wrapper">
      <div class="bullet_title">
        {{ title }}
      </div>
      <div class="bullet_caption">
        {{ caption }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.bullet{
  &_wrapper{
    padding: 32px;
    background: $light-pink;
    border-radius: 8px;
    min-width: 256px;
  }
  &_title{
    color: $yellow-brown;
    font-family: $title-font;
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }
  &_caption{
    color: $light-brown;
    font-size: 14px;
    text-align: center;
  }
}
</style>
