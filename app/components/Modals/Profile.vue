<template>
    <UDrawer v-model:open="ui.isProfileDrawerOpen" direction="left" inset handle-only>
        <template #content>
            <UTabs class="min-w-96 min-h-96 size-full m-4" color="neutral" :items="items">

                <!-- Account Tab -->
                <template #account>
                    <UForm :schema="profileSchema" :state="profileState" @submit="onUpdateProfile"
                        class="flex flex-col gap-4">
                        <UFormField label="Name" name="name">
                            <UInput v-model="profileState.name" class="w-full" />
                        </UFormField>
                        <UFormField label="Email" name="email">
                            <UInput v-model="profileState.email" class="w-full" />
                        </UFormField>
                        <UButton type="submit" color="primary" label="Save Changes" class="mt-4 self-end" />
                    </UForm>
                </template>

                <!-- Password Tab -->
                <template #password>
                    <UForm :schema="passwordSchema" :state="passwordState" @submit="onChangePassword"
                        class="flex flex-col gap-4">

                        <!-- Current Password -->
                        <UFormField label="Current Password" name="currentPassword">
                            <UInput v-model="passwordState.currentPassword" :type="showCurrent ? 'text' : 'password'"
                                class="w-full">
                                <template #trailing>
                                    <UButton color="neutral" variant="link" size="sm"
                                        :icon="showCurrent ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                                        :aria-label="showCurrent ? 'Hide password' : 'Show password'"
                                        :aria-pressed="showCurrent" @click="showCurrent = !showCurrent" />
                                </template>
                            </UInput>
                        </UFormField>

                        <!-- New Password -->
                        <UFormField label="New Password" name="newPassword">
                            <UInput v-model="passwordState.newPassword" :type="showNew ? 'text' : 'password'"
                                class="w-full">
                                <template #trailing>
                                    <UButton color="neutral" variant="link" size="sm"
                                        :icon="showNew ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                                        :aria-label="showNew ? 'Hide password' : 'Show password'"
                                        :aria-pressed="showNew" @click="showNew = !showNew" />
                                </template>
                            </UInput>
                        </UFormField>

                        <!-- Confirm Password -->
                        <UFormField label="Confirm Password" name="confirmPassword">
                            <UInput v-model="passwordState.confirmPassword" :type="showConfirm ? 'text' : 'password'"
                                class="w-full">
                                <template #trailing>
                                    <UButton color="neutral" variant="link" size="sm"
                                        :icon="showConfirm ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                                        :aria-label="showConfirm ? 'Hide password' : 'Show password'"
                                        :aria-pressed="showConfirm" @click="showConfirm = !showConfirm" />
                                </template>
                            </UInput>
                        </UFormField>

                        <UButton type="submit" color="primary" label="Update Password" class="mt-4 self-end" />
                    </UForm>
                </template>

            </UTabs>
        </template>
    </UDrawer>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import * as v from 'valibot'
import { useUiStore } from '../../composables/useUiStore'
import { useAuthStore } from '../../../stores/auth'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import type { FormSubmitEvent } from '@nuxt/ui'
const toast = useToast()
const ui = useUiStore()
const auth = useAuthStore()
const items = [
    { label: 'Account', icon: 'i-lucide-user', slot: 'account' },
    { label: 'Password', icon: 'i-lucide-lock', slot: 'password' }
]

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

// ------------------ Schemas ------------------ //
const profileSchema = v.object({
    name: v.pipe(v.string(), v.minLength(2, t('Name is required'))),
    email: v.pipe(v.string(), v.email(t('Invalid email')))
})
type ProfileSchema = v.InferOutput<typeof profileSchema>

const passwordSchema = v.pipe(
    v.object({
        currentPassword: v.pipe(
            v.string(),
            v.minLength(1, t('Current password is required'))
        ),
        newPassword: v.pipe(
            v.string(),
            v.minLength(6, t('Password must be at least 6 characters'))
        ),
        confirmPassword: v.string()
    }),
    v.forward(
        v.check<{ currentPassword: string; newPassword: string; confirmPassword: string }>(
            (data) => data.newPassword === data.confirmPassword,
            t('Passwords do not match')
        ),
        ['confirmPassword']
    )
)


type PasswordSchema = v.InferOutput<typeof passwordSchema>

// ------------------ State ------------------ //
const profileState = reactive<ProfileSchema>({
    name: '',
    email: ''
})

const passwordState = reactive<PasswordSchema>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// لما يفتح drawer → يجيب بيانات اليوزر
watch(
    () => ui.isProfileDrawerOpen,
    (open) => {
        if (open && auth.user) {
            profileState.name = auth.user.name || ''
            profileState.email = auth.user.email || ''
        }
    }
)

// ------------------ Handlers ------------------ //
const onUpdateProfile = async (event: FormSubmitEvent<ProfileSchema>) => {
  try {
    await auth.updateProfile(event.data)
    ui.isProfileDrawerOpen = false

    toast.add({
      title: t('Success'),
      description: t('Profile updated successfully'),
      color: 'success'
    })
  } catch (err: any) {
    console.error('Update profile failed:', err)

    let errors: any[] = []

    if (err?.response?._data) {
      // لو السيرفر رجع JSON
      errors = Array.isArray(err.response._data.errors)
        ? err.response._data.errors
        : [{ msg: err.response._data.message }]
    } else if (Array.isArray(err?.errors)) {
      errors = err.errors
    } else {
      errors = [{ msg: err.message }]
    }

    errors.forEach(e => {
      toast.add({
        title: t('Error'),
        description: e.msg || t('Failed to update profile'),
        color: 'warning'
      })
    })
  }
}


const onChangePassword = async (event: FormSubmitEvent<PasswordSchema>) => {
    try {
        await auth.changePassword({
            currentPassword: event.data.currentPassword,
            newPassword: event.data.newPassword
        })
        ui.isProfileDrawerOpen = false
        toast.add({
            title: t('Success'),
            description: t('Password changed successfully'),
            color: 'success'
        })
    } catch (err: any) {
        // حاول نقرأ body من الـ FetchError
        let errors: any[] = []

        if (err?.response?._data) {
            // لو السيرفر رجع JSON
            errors = Array.isArray(err.response._data.errors) ? err.response._data.errors : [{ msg: err.response._data.message }]
        } else {
            errors = [{ msg: err.message }]
        }

        errors.forEach(e => {
            toast.add({
                title: t('Error'),
                description: e.msg || t('Unknown error'),
                color: 'warning'
            })
        })
    }
}

</script>