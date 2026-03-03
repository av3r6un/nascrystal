<template>
  <div class="mobilenav">
    <div class="mobilenav_wrapper">
      <div class="mobilenav_menu">
        <div class="mobilenav_menu-item">
          <NuxtLink to="/panel/catalog" class="base_link">
            <Icon name="nsc:grid" :size="24" />
          </NuxtLink>
        </div>
        <div class="mobilenav_menu-item">
          <NuxtLink to="/panel/stock" class="base_link">
            <Icon name="nsc:box" :size="24" />
          </NuxtLink>
        </div>
        <div class="mobilenav_menu-item">
          <NuxtLink to="/panel/purchases" class="base_link">
            <Icon name="nsc:shopping-cart" :size="24" />
          </NuxtLink>
        </div>
        <div class="mobilenav_menu-item">
          <NuxtLink to="/panel" class="base_link">
            <Icon name="nsc:dashgrid" :size="24" />
          </NuxtLink>
        </div>
        <div class="mobilenav_menu-item">
          <NuxtLink to="/panel/home" class="base_link">
            <Icon name="nsc:home" :size="24" />
          </NuxtLink>
        </div>
        <div class="mobilenav_menu-item">
          <NuxtLink to="/panel/static" class="base_link">
            <Icon name="nsc:pages" :size="24" />
          </NuxtLink>
        </div>
        <div class="mobilenav_menu-item">
          <NuxtLink to="/panel/settings" class="base_link">
            <Icon name="nsc:cog" :size="24" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.mobilenav{
  margin: 0 25px;
  @media (max-width: 390px) {
    margin: 0 16px;
  }
  &_wrapper{
    padding: 15px;
    background: $light-pink;
    border-radius: 8px;
    border: 0.8px solid $semi-grey;
  }
  &_menu{
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    &-item{
      padding: 5px;
      border-radius: 8px;
      .base_link{
        display: flex;
      }
      cursor: pointer;
       &:has(.router-link-exact-active) {
        background: $pinky;
      }
    }
  }
}
</style>
