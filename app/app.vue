<template>
  <UApp>
    <div :class="`app-${locale}`">
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </div>
  </UApp>
</template>
<script>
import './assets/css/main.scss';
</script>
<script setup>
const { locale } = useI18n()
</script>
