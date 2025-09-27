<template>
  <ClientOnly>
    <BodyShine />
  </ClientOnly>
  <h1 class="title text-3xl">{{ $t('Beyond limits with ChatGPT + Gemini') }}</h1>
  <!-- Chat Section (SPA) -->
  <ClientOnly>
    <CreateChat />
  </ClientOnly>
</template>
<script setup>
definePageMeta({
  middleware: ['auth-client']
})
const print = async () => {
  window.alert("مرحبا سامر")
}
</script>
<style lang="scss" scoped>
.title {
  text-align: center;
  margin-top: 100px;
  margin-bottom: 30px;
  font-weight: 600;
}
</style>
