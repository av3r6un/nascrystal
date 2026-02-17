<template>
  <div>
    <Header />
    <main class="content">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {};
  },
};
</script>
