<template>
  <div>
    <ClientOnly>
      <BodyShine />
    </ClientOnly>

    <h1 class="title text-3xl">{{ $t('Try AI Chat - No Registration Required') }}</h1>
    <!-- Guest Notice -->
    <div class="guest-notice">
      <UAlert 
        icon="i-lucide-user" 
        color="blue" 
        variant="soft"
        :title="$t('Guest Mode')"
        :description="$t('You are chatting as a guest. Your conversations are saved locally and will be lost when you clear your browser data. Sign up to save your conversations permanently.')"
      />
    </div>
    
    <!-- Chat Section -->
    <ClientOnly>
      <CreateGuestChat />
    </ClientOnly>
    
    <!-- Sign up prompt -->
    <div class="signup-prompt">
      <UCard variant="subtle">
        <template #header>
          <h3>{{ $t('Want to save your conversations?') }}</h3>
        </template>
        
        <p>{{ $t('Sign up for free to save your chat history and access advanced features.') }}</p>
        
        <div class="flex gap-2 mt-4">
          <UButton 
            color="primary" 
            variant="solid" 
            @click="goToSignup"
            class="btn btn-main">
            {{ $t("Sign Up Free") }}
          </UButton>
          <UButton 
            color="gray" 
            variant="outline" 
            @click="goToLogin"
            class="btn btn-secondary">
            {{ $t("Login") }}
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import CreateGuestChat from '../components/Guest/CreateGuestChat.vue'
import {useModelsStore} from '../../stores/Models'
import {  onMounted  } from 'vue'
const ModelsStore = useModelsStore()

definePageMeta({
  middleware: [],
  layout: 'guest'
})
function goToSignup() {
  window.location.href = '/signup'
}

function goToLogin() {
  window.location.href = '/login'
}
onMounted(() => {
  if(!localStorage.getItem('models')){
    ModelsStore.fetchGuestModels()
  }
})
</script>

<style lang="scss" scoped>
.title {
  text-align: center;
  margin-top: 50px;
  margin-bottom: 20px;
  font-weight: 600;
}

.guest-notice {
  max-width: 600px;
  margin: 20px auto;
}

.signup-prompt {
  max-width: 500px;
  margin: 40px auto;
}
</style>
