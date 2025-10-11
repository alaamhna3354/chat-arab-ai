<template>
  <div class="chat-box">
    <div v-if="isSending"
      class="fixed inset-0 z-50 backdrop-blur-sm bg-elevated/75 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3 text-white">
        <UIcon name="svg-spinners:pulse-multiple"
                    class="size-15 text-gradient bg-gradient-to-r from-[#5d6faf] from-10% via-[#3ae8fb] via-40% to-[#a960c1] to-90%" />
      </div>
    </div>
    <form @submit.prevent="createNewGuestChat">
      <textarea id="textarea" v-model="input" @input="autoResize" @keyup.enter.exact.prevent="createNewGuestChat"
        :placeholder="$t('Ask anything')" :disabled="isSending" ref="textareaRef">
      </textarea>

      <div class="flex justify-between items-center">
        <div>
          <!-- زر إضافة ملفات -->
          <UDropdownMenu :items="[[{
            label: 'Upload Files',
            icon: 'akar-icons:attach',
            disabled: true,
            onSelect: () => { } // معطل حالياً للضيوف
          }]]" :ui="{ content: 'w-48' }">
            <UTooltip class="me-1" :delay-duration="0" text="Add Files (Coming Soon)">
              <UButton color="neutral" variant="ghost" icon="iconamoon:sign-plus-bold" disabled />
            </UTooltip>
          </UDropdownMenu>

          <!-- زر اختيار الموديل -->
          <SelectModel />
        </div>

        <button class="send" :class="input == '' || isSending ? 'empty' : ''" type="submit" :disabled="isSending">
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
    const conversationId = guestChat.createGuestConversation()
    guestChat.addMessage(conversationId, { role: 'user', content: input.value })

    guestChat.sendMessageToAI(input.value, guestChat.selectedModel, {
      onStart: () => {
        console.log('🚀 Guest streaming started')
      },
      onChunk: (text) => {
        const messages = guestChat.getMessages(conversationId)
        const last = messages[messages.length - 1]
        if (!last || last.role !== 'assistant') {
          guestChat.addMessage(conversationId, { role: 'assistant', content: text })
        } else {
          last.content += text
        }
      },
      onComplete: () => {
        console.log('✅ Guest streaming done')
        router.push(`/guest-chat/${conversationId}`)
        isSending.value = false // ✅ فقط بعد اكتمال الستريمنغ
      },
      onError: (err) => {
        console.error('❌ Guest stream error:', err)
        isSending.value = false // ✅ بعد أي خطأ
      },
    })

    input.value = ''
  } catch (err) {
    console.error('Failed to create guest conversation:', err)
    isSending.value = false
  }
}


</script>
