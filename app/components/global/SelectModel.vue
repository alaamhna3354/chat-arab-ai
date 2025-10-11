<template>
    <USelect v-model="ModelsStore.selectedModel" :items="ModelsStore.modelOptions" variant="none" class="w-15"
        :ui="{ content: 'min-w-fit', trailingIcon: 'hidden', itemTrailingIcon: 'hidden' }">
        <!-- template Selected Value in select -->
        <template #default="{ modelValue }">
            <div class="flex items-center gap-2">
                <UIcon :name="getIcon(modelValue)" class="size-5" />
            </div>
        </template>
        <!-- Icon Selected Value in list -->
        <template #item-trailing="{ item }">
            <UIcon :name="item.value === ModelsStore.selectedModel ? 'line-md:reddit-loop' : ''" 
            class="size-7" />
        </template>
    </USelect>
</template>

<script setup>
import { useModelsStore } from '../../../stores/Models'
const ModelsStore = useModelsStore()

function getIcon(value) {
    if (!value) return 'lucide-cpu'
    if (value.startsWith('gpt')) return 'logos:openai-icon'
    if (value.startsWith('gemini')) return 'material-icon-theme:gemini-ai'
    return 'lucide-cpu'
}

</script>