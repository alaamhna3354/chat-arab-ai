<template>
  <div v-if="auth.isAuthenticated">
    <ClientOnly>
      <BodyShine />
    </ClientOnly>
    <h1 class="title text-3xl">{{ $t('Beyond limits with ChatGPT + Gemini') }}</h1>
    <!-- Chat Section (SPA) -->
    <ClientOnly>
      <CreateChat />
    </ClientOnly>
  </div>
  
  <!-- Guest redirect -->
  <div v-else class="guest-redirect">
    <UCard class="max-w-md mx-auto">
      <template #header>
        <h2>{{ $t('Welcome to AI Chat') }}</h2>
      </template>
      
      <p class="mb-4">{{ $t('Choose how you want to start chatting:') }}</p>
      
      <div class="space-y-2">
        <UButton 
          color="neutral" 
          variant="subtle" 
          @click="goToGuest"
          class="w-full">
          {{ $t("Try as Guest") }}
        </UButton>
        
        <UButton 
          color="gray" 
          variant="outline" 
          @click="goToSignup"
          class="w-full">
          {{ $t("Sign Up for Free") }}
        </UButton>
        
        <UButton 
          color="gray" 
          variant="ghost" 
          @click="goToLogin"
          class="w-full">
          {{ $t("Login") }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

definePageMeta({
  middleware: []
})

function goToGuest() {
  window.location.href = '/guest'
}

function goToSignup() {
  window.location.href = '/signup'
}

function goToLogin() {
  window.location.href = '/login'
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
