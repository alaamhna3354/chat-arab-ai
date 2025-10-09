<template>
  <div v-if="Loaded">
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
      <ClientOnly>
        <BodyShine />
      </ClientOnly>
      <UCard variant="subtle" class="max-w-md mx-auto mt-5">
        <template #header>
          <h1 class="text-md sm:text-xl">{{ $t('Beyond limits with ChatGPT + Gemini') }}</h1>
        </template>

        <p class="mb-4">{{ $t('Choose how you want to start chatting:') }}</p>

        <div class="space-y-2">
          <UButton color="neutral" variant="subtle" @click="goToGuest" class="w-full">
            {{ $t("Try as Guest") }}
          </UButton>

          <UButton color="gray" variant="outline" @click="goToSignup" class="w-full">
            {{ $t("Sign Up for Free") }}
          </UButton>

          <UButton color="gray" variant="ghost" @click="goToLogin" class="w-full">
            {{ $t("Login") }}
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
  <transition name="fade">
    <div v-if="!Loaded" class="fixed z-1000 inset-0 backdrop-blur-sm bg-elevated/75 flex items-center justify-center">
    <div class="flex flex-col items-center gap-3 text-white">
      <UIcon name="svg-spinners:pulse-multiple" class="size-10 text-[#21221f]" />
    </div>
  </div>
  </transition>
  
</template>
<script setup>
import { useAuthStore } from '../../stores/auth'
import { ref, onMounted } from 'vue'
const auth = useAuthStore()
const Loaded = ref(false)
onMounted(async () => {
  Loaded.value = true;
})
definePageMeta({
  middleware: []
})

function goToGuest() {
  navigateTo('/guest')
}

function goToSignup() {
  navigateTo('/signup')
}

function goToLogin() {
  navigateTo('/login')
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
<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }
</style>
