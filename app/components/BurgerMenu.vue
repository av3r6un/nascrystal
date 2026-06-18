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
      <div class="burger_menu-item">
        <NuxtLink to="/" class="base_link" @click="closeMenu">
          {{ $t('navbar.home') }}
        </NuxtLink>
      </div>
      <div class="burger_menu-item">
        <NuxtLink to="/catalog" class="base_link" @click="closeMenu">
          {{ $t('navbar.catalog') }}
        </NuxtLink>
      </div>
      <div class="burger_menu-item">
        <NuxtLink to="/about" class="base_link" @click="closeMenu">
          {{ $t('navbar.about') }}
        </NuxtLink>
      </div>
      <div class="burger_menu-item">
        <NuxtLink to="/prices" class="base_link" @click="closeMenu">
          {{ $t('navbar.prices') }}
        </NuxtLink>
      </div>
      <div class="burger_menu-item">
        <NuxtLink to="/contacts" class="base_link" @click="closeMenu">
          {{ $t('navbar.contacts') }}
        </NuxtLink>
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
    navbarItems() {
      const navbar = this.$tm('navbar');
      if (!navbar || typeof navbar !== 'object' || Array.isArray(navbar)) {
        return [];
      }

      return Object.entries(navbar).map(([path, label]) => ({
        path: this.$rt(path),
        label: this.$rt(label),
      }));
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
    closeMenu() {
      this.state = false;
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
    color: $light-brown;
    &-item{
      margin-bottom: 8px;
    }
  }
}
</style>
