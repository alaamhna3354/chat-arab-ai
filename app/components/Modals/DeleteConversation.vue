<script setup lang="ts">
defineProps<{
  count: number
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <UModal
    @click="emit('close', true);"
    :title="$t('Are you sure you want to delete this conversation?')"
  >
    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" :label="$t('Cancel')" @click="emit('close', false)" />
        <UButton color="error" :label="$t('Delete')" @click="emit('close', true);" />
      </div>
    </template>
  </UModal>
</template>
