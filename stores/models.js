// stores/models.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModelsStore = defineStore('models', () => {
    const selectedModel = ref('gpt-4o-mini')
    const modelOptions = ref([])

    // 🧩 نعرف icons والlabels لكل موديل محتمل
    const modelMeta = {
        'gpt-4o-mini': { label: 'OpenAI GPT-4o Mini', icon: 'logos:openai-icon' },
        'gpt-4o': { label: 'OpenAI GPT-4o', icon: 'logos:openai-icon' },
        'gpt-3.5-turbo': { label: 'OpenAI GPT-3.5 Turbo', icon: 'logos:openai-icon' },
        'gemini-2.5-flash': { label: 'Google Gemini Flash', icon: 'material-icon-theme:gemini-ai' },
        'gemini-2.5-pro': { label: 'Google Gemini Pro', icon: 'material-icon-theme:gemini-ai' },
    }

    // ✅ لما نسجل الدخول نحدث الـ modelOptions ديناميكياً
    function setAvailableModels(models) {
        modelOptions.value = [
            models.map(model => {
                const meta = modelMeta[model] || { label: model, icon: 'lucide-cpu' }

                return {
                    label: meta.label,
                    value: model,
                    icon: meta.icon,
                }
            })
        ]
    }

    // fetch Guest Models
    async function fetchGuestModels() {
        const config = useRuntimeConfig()

        try {
            const data = await $fetch(`${config.public.apiBase}/auth/bootstrap`)
            setAvailableModels(data.availableModels)
            return data
        } catch (err) {
            throw err
        }
    }
    return {
        selectedModel,
        modelOptions,
        setAvailableModels,
        fetchGuestModels
    }
}, {
    persist: true
})
