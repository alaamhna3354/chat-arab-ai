<script setup lang="ts">
definePageMeta({
   layout: 'empty',
   middleware: ['guest-client'] // بدون .client.ts
})
import * as v from 'valibot'
import { reactive, ref, computed } from 'vue'
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
  name: v.pipe(v.string(), v.minLength(4, t('At least 4 characters'))),
  email: v.pipe(v.string(), v.email(t('Invalid email'))),
  password: v.pipe(v.string(), v.minLength(8, ''))
})
type Schema = v.InferOutput<typeof schema>

const state = reactive<Schema>({
  name:'',
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
  if ( !state.name || !state.password || !state.password) {
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
    await auth.signup({ name: state.name, email: state.email, password: state.password })
    toast.add({ title: t('Success'), description: t('Sign up successfully!'), color: 'success' })
    navigateTo('/')
  } catch (err: any) {
    toast.add({ title: t('Error'), description: err.response._data.message, color: 'error' })
  } finally {
    loading.value = false
  }
}


</script>

<template>
  <ClientOnly>
    <div class="signup">
        <BodyShine />
    <UForm :schema="schema" :state="state" class="signup-form space-y-4" @submit.prevent="onSubmit">
    <h1 class="text-4xl font-semibold text-center">{{ $t('Sign up') }}</h1>
    <h2 class="mt-3 mb-3 font-semibold text-[#6c6c6c] text-center">{{ $t('Beyond limits with ChatGPT + Gemini') }}</h2>
   <!-- Name -->
   <UFormField label="Name" name="name">
        <UInput
          class="w-full"
          trailing-icon="i-lucide-at-sign"
          placeholder="Enter your name"
          size="md"
          v-model="state.name"
          type="text"
          :disabled="loading || cooldown > 0"
        />
      </UFormField>
    <!-- Email -->
      <UFormField label="Email" name="email">
        <UInput
          class="w-full"
          trailing-icon="i-lucide-at-sign"
          placeholder="Enter your email"
          size="md"
          v-model="state.email"
          type="email"
          :disabled="loading || cooldown > 0"
        />
      </UFormField>

      <!-- Password with strength -->
      <div class="space-y-2">
        <UFormField label="Password" name="password">
          <UInput
            v-model="state.password"
            placeholder="Password"
            :color="color"
            :type="show ? 'text' : 'password'"
            :aria-invalid="score < 4"
            aria-describedby="password-strength"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'"
                :aria-pressed="show"
                @click="show = !show"
              />
            </template>
          </UInput>
        </UFormField>

        <UProgress
          :color="color"
          :indicator="text"
          :model-value="score"
          :max="4"
          size="sm"
        />

        <ul id="password-strength" class="space-y-1" aria-label="Password requirements">
          <li
            v-for="(req, index) in strength"
            :key="index"
            class="flex items-center gap-1"
            :class="req.met ? 'text-success' : 'text-muted'"
          >
            <UIcon :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'" class="size-4 shrink-0" />
            <span class="text-xs font-light">{{ req.text }}</span>
          </li>
        </ul>
      </div>

      <UButton type="submit" class="w-full h-[40px] text-lg flex justify-center items-center" :disabled="loading || cooldown > 0" color="neutral">
        <span v-if="loading">{{ $t('Please wait') }}...</span>
        <span v-else-if="cooldown > 0">{{ $t('Wait') }} {{ cooldown }}s</span>
        <span v-else>{{ $t('Sign up') }}</span>
      </UButton>

      <p class="text-sm mt-2">
       {{ $t('have an account?') }}
        <NuxtLink to="/login" class="text-blue-500">{{ $t('Log in') }}</NuxtLink>
      </p>
    </UForm>
  </div>
      </ClientOnly>
</template>

<style lang="scss">
.signup {
  display: grid;
  .signup-form {
    padding: 20px;
    margin: 40px auto;
    border-radius: 25px;
    min-width: 400px;
    @media (max-width:768px) {
      min-width: 100%;
    }
  }
}
</style>
