<script setup lang="ts">
defineProps<{
  count: number
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <UModal
    @click="emit('close', true);"
    :title="`Are you sure you want to delete ?`"
  >
    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" label="Cancel" @click="emit('close', false)" />
        <UButton color="error" label="Delete" @click="emit('close', true);" />
      </div>
    </template>
  </UModal>
</template>
