<script setup lang="ts">
defineProps<{
  count: number,
  convTitle:String
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <UModal
    @click="emit('close', true);"
  >
  <template #header>
    <div>{{ $t('You want to delete') }} <strong>{{ convTitle  }}</strong> ?</div>
  </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" :label="$t('Cancel')" @click="emit('close', false)" />
        <UButton color="error" :label="$t('Delete')" @click="emit('close', true);" />
      </div>
    </template>
  </UModal>
</template>
