<template>
  <div class="burger" :class="{ shown: state }">
    <div
      v-if="burgerIcon"
      class="burger_button"
      @click="toggleMenu"
    >
      <Icon :name="burgerIcon" :size="24" />
    </div>
    <div v-if="state" class="burger_menu">
      <div v-for="(n, l, idx) in $tm('navbar')" :key="idx" class="burger_menu-item">
        <NuxtLink :to="`/${$rt(l)}`" class="base_link">{{ $rt(n) }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BurgerMenu',
  data() {
    return {
      state: false,
    };
  },
  computed: {
    burgerIcon() {
      return this.state ? 'nsc:burger-close' : 'nsc:burger';
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    toggleMenu() {
      this.state = !this.state;
    },
    handleClickOutside(event) {
      const target = event.target;
      if (this.state && this.$el && !this.$el.contains(target)) {
        this.state = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.burger{
  display: none;
  margin-left: 20px;
  position: relative;
  @media screen {
    @media (max-width: 768px) {
      display: block;
    }
  }
  &_button{
    position: absolute;
    cursor: pointer;
    z-index: 6;
    top: -13px;
    .m-icon{
      pointer-events: none;
    }
  }
  &_menu{
    position: fixed;
    z-index: 5;
    background: $light-pink;
    top: 32px;
    right: 0;
    height: 100%;
    font-size: 18px;
    padding: 20px 40px 0 20px;
    font-weight: 100;
    color: $light-brown;
    &-item{
      margin-bottom: 8px;
    }
  }
}
</style>
