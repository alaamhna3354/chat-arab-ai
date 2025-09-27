<template>
  <NuxtLayout>
    <UApp>
      <div :class="`app-${locale}`">
        <NuxtRouteAnnouncer />
        <NuxtPage />
      </div>
    </UApp>
  </NuxtLayout>
</template>
<script>
import './assets/css/main.scss';
</script>
<script setup>
const { locale } = useI18n()
</script>
