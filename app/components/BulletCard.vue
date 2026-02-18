<template>
  <div class="bullet">
    <div class="bullet_wrapper" :class="{ bg: !reversed }">
      <div class="bullet_icon" :class="{ bg: reversed }">
        <Icon :name="`nsc:${icon}`" :size="24" />
      </div>
      <div class="bullet_title">
        {{ title }}
      </div>
      <div class="bullet_info">
        {{ info }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BulletCard',
  props: {
    icon: {
      type: String,
      default: 'star',
    },
    title: {
      type: String,
      required: true,
    },
    info: {
      type: String,
    },
    reversed: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.bullet {
  &_wrapper{
    width: 286px;
    height: 200px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 36px;
    box-sizing: border-box;
    background: $white;
    &.bg {
      background: $light-pink;
    }
  }
  &_icon{
    margin-bottom: 16px;
    &.bg{
      margin-bottom: 20px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $pinky;
    }
  }
  &_title{
    color: $brown;
    font-family: $title-font;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  &_info{
    color: $light-brown;
    font-size: 14px;
    text-align: center;
  }
}
</style>
