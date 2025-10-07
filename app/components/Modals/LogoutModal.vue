<script setup lang="ts">
defineProps<{
  count: number
}>()

const emit = defineEmits<{ close: [boolean] }>()
import { useAuthStore } from '../../../stores/auth'
const auth = useAuthStore()
</script>

<template>
  <UModal
    @click="emit('close', false)"
    :title="$t('Are you sure you want to log out?')"
  >
    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" :label="$t('Cancel')" @click="emit('close', false)" />
        <UButton color="error" :label="$t('Log out')" @click="emit('close', true);auth.logout()" />
      </div>
    </template>
  </UModal>
</template>
