<template>
  <div class="chat-box">
    <form @submit.prevent="createNewGuestChat">
      <textarea 
        id="textarea" 
        v-model="input" 
        @input="autoResize" 
        @keyup.enter.exact.prevent="createNewGuestChat"
        :placeholder="$t('Ask anything')" 
        :disabled="isSending"
        ref="textareaRef">
      </textarea>
      
      <div class="flex justify-between items-center">
        <div>
          <!-- زر إضافة ملفات -->
          <UDropdownMenu :items="[[{
            label: 'Upload Files',
            icon: 'akar-icons:attach',
            disabled: true,
            onSelect: () => {} // معطل حالياً للضيوف
          }]]" :ui="{ content: 'w-48' }">
            <UTooltip class="me-1" :delay-duration="0" text="Add Files (Coming Soon)">
              <UButton color="neutral" variant="ghost" icon="iconamoon:sign-plus-bold" disabled />
            </UTooltip>
          </UDropdownMenu>
          
          <!-- زر اختيار الموديل -->
          <UDropdownMenu :items="modelOptions" :ui="{ content: 'w-48' }">
            <UTooltip class="me-1" :delay-duration="0" text="AI Model">
              <UButton color="neutral" variant="ghost" :icon="selectedModel === 'openai' ? 'logos:openai-icon' : 'material-icon-theme:gemini-ai'" />
            </UTooltip>
          </UDropdownMenu>
        </div>
        
        <button 
          class="send" 
          :class="input == '' || isSending ? 'empty' : ''" 
          type="submit" 
          :disabled="isSending">
          <UIcon name="majesticons:arrow-up" class="text-xl" />
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useGuestChatStore } from '../../../stores/guestChat'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const guestChat = useGuestChatStore()
const router = useRouter()
const input = ref('')
const isSending = ref(false)
const textareaRef = ref(null)
const selectedModel = ref('openai')

// خيارات الموديلات
const modelOptions = [[
  {
    label: 'OpenAI GPT-4',
    icon: 'logos:openai-icon',
    onSelect: () => {
      selectedModel.value = 'openai'
      console.log('Selected model:', selectedModel.value)
    }
  },
  {
    label: 'Google Gemini Flash',
    icon: 'material-icon-theme:gemini-ai',
    onSelect: () => {
      selectedModel.value = 'google'
      console.log('Selected model:', selectedModel.value)
    }
  }
]]

function autoResize() {
  const textarea = textareaRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

const createNewGuestChat = async () => {
  if (!input.value || isSending.value) return
  isSending.value = true

  try {
    // إنشاء محادثة جديدة للضيف
    const conversationId = guestChat.createGuestConversation()
    
    console.log('Creating chat with model:', selectedModel.value)
    
    // إرسال الرسالة الأولى
    const result = await guestChat.sendMessageToAI(input.value, conversationId, selectedModel.value)
    
    if (result.success) {
      // الانتقال إلى صفحة المحادثة
      router.push(`/guest-chat/${conversationId}`)
    } else {
      console.error('Failed to send message:', result.error)
    }
    
    input.value = ''
  } catch (err) {
    console.error('Failed to create guest conversation:', err)
  } finally {
    isSending.value = false
  }
}
</script>
