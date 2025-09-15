<script setup lang="ts">
import { useHead } from '#imports'

useHead({
  script: [
    {
      src: 'https://accounts.google.com/gsi/client',
      async: true,
      defer: true
    }
  ]
})
definePageMeta({
  middleware: ['guest-client'] // بدون .client.ts
})
import * as v from 'valibot'
import { reactive, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToast()

// Cooldown & Loading
const cooldown = ref(0)
const loading = ref(false)
let cooldownTimer: any = null
function startCooldown(seconds: number) {
  cooldown.value = seconds
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

// Valibot Schema
const schema = v.object({
  email: v.pipe(v.string(), v.email(t('Invalid email'))),
  password: v.pipe(v.string(), v.minLength(8, ''))
})
type Schema = v.InferOutput<typeof schema>

const state = reactive<Schema>({
  email: '',
  password: ''
})

// Password strength logic
const show = ref(false)
function checkStrength(str: string) {
  const requirements = [
    { regex: /.{8,}/, text: t('At least 8 characters') },
    { regex: /\d/, text: t('At least 1 number') },
    { regex: /[a-z]/, text: t('At least 1 lowercase letter') },
    { regex: /[A-Z]/, text: t('At least 1 uppercase letter') }
  ]
  return requirements.map(req => ({ met: req.regex.test(str), text: req.text }))
}
const strength = computed(() => checkStrength(state.password))
const score = computed(() => strength.value.filter(req => req.met).length)
const color = computed(() => {
  if (score.value === 0) return 'neutral'
  if (score.value <= 1) return 'error'
  if (score.value <= 3) return 'warning'
  return 'success'
})
const text = computed(() => {
  if (score.value === 0) return 'Enter a password'
  if (score.value <= 2) return 'Weak password'
  if (score.value === 3) return 'Medium password'
  return 'Strong password'
})

// Submit Handler
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!state.email || !state.password) {
    toast.add({
      title: t('Validation Error'),
      description: t('Please fill in all fields.'),
      color: 'warning'
    })
    return
  }

  if (cooldown.value > 0) return
  loading.value = true

  try {
    await auth.login({ email: state.email, password: state.password })
    toast.add({ title: t('Success'), description: t('Logged in successfully!'), color: 'success' })
    await navigateTo('/')
  } catch (err: any) {
    toast.add({ title: t('Error'), description: err.response._data.message, color: 'error' })
  } finally {
    loading.value = false
  }
}
// login by google

// await auth.loginWithGoogleToken(googleIdToken)

const config = useRuntimeConfig();

onMounted(() => {
  const google = (window as any).google;
  google.accounts.id.initialize({
    client_id: config.public.googleClientId,
    callback: handleGoogleResponse
  });

  google.accounts.id.renderButton(
    document.getElementById('g_id_signin'),
    { theme: 'outline', size: 'large' }
  );

  google.accounts.id.prompt(); // optional, for One Tap
});
function handleGoogleResponse(response: any) {
  console.log("Full response:", response);
  console.log("Google ID Token:", response.credential); // هون التوكين
  auth.loginWithGoogleToken(response.credential)
}
</script>

<template>
  <div class="login">
    <ClientOnly>
      <BodyShine />
      <UForm :schema="schema" :state="state" class="login-form space-y-4" @submit.prevent="onSubmit">
        <h1 class="text-4xl font-semibold text-center">{{ $t('Log in') }}</h1>
        <h2 class="mt-3 mb-3 font-semibold text-[#6c6c6c] text-center">{{ $t('Beyond limits with ChatGPT + Gemini') }}
        </h2>
        <!-- Email -->
        <UFormField label="Email" name="email">
          <UInput class="w-full" trailing-icon="i-lucide-at-sign" :placeholder="$t('Enter your email')" size="md"
            v-model="state.email" type="email" :disabled="loading || cooldown > 0" />
        </UFormField>

        <!-- Password with strength -->
        <div class="space-y-2">
          <UFormField label="Password" name="password">
            <UInput v-model="state.password" :placeholder="$t('Password')" :color="color"
              :type="show ? 'text' : 'password'" :aria-invalid="score < 4" aria-describedby="password-strength"
              class="w-full">
              <template #trailing>
                <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show" @click="show = !show" />
              </template>
            </UInput>
          </UFormField>

          <UProgress :color="color" :indicator="text" :model-value="score" :max="4" size="sm" />

          <ul id="password-strength" class="space-y-1" aria-label="Password requirements">
            <li v-for="(req, index) in strength" :key="index" class="flex items-center gap-1"
              :class="req.met ? 'text-success' : 'text-muted'">
              <UIcon :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'" class="size-4 shrink-0" />
              <span class="text-xs font-light">{{ req.text }}</span>
            </li>
          </ul>
        </div>

        <UButton type="submit" class="w-full h-[40px] text-lg flex justify-center items-center"
          :disabled="loading || cooldown > 0" color="neutral">
          <span v-if="loading">{{ $t('Please wait') }}...</span>
          <span v-else-if="cooldown > 0">{{ $t('Wait') }} {{ cooldown }}s</span>
          <span v-else>{{ $t('Log in') }}</span>
        </UButton>

        <p class="text-sm mt-2">
          {{ $t('Don’t have an account?') }}
          <NuxtLink to="/signup" class="text-blue-500">{{ $t('Sign up') }}</NuxtLink>
        </p>
      </UForm>
    </ClientOnly>
    <div style="padding:0 20px;">
      <span class="font-semibold block m-auto text-center mb-2">Or</span>
      <!-- login by google -->
      <div id="g_id_onload" data-client_id="825528766846-gbq9m05amb2rdbdk5pv9bvp89b4fgqtf.apps.googleusercontent.com"
        data-callback="loginGoogle">
      </div>
      <div class="g_id_signin" data-type="standard"></div>
    </div>
  </div>
</template>

<style lang="scss">
.login {
  display: grid;
  max-width: 400px;
  margin: 0 auto;

  .login-form {
    padding: 20px;
    margin: 50px auto;
    margin-bottom: 0;
    border-radius: 25px;
    width: 100%;

    @media (max-width:768px) {
      min-width: 100%;
    }
  }

  .loginGoogle {
    background-color: transparent;
    color: #0f172b;
    border: 1px solid #0f172b;
    margin-bottom: 40px;
    transition: .3s;

    &:hover {
      background-color: #ececec;
    }
  }
}
</style>
