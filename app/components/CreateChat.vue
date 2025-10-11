<template>
  <div class="chat-box">
    <div v-if="isSending"
      class="fixed inset-0 z-50 backdrop-blur-sm bg-elevated/75 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3 text-white">
        <UIcon name="svg-spinners:pulse-multiple"
        class="size-15 text-gradient bg-gradient-to-r from-[#5d6faf] from-10% via-[#3ae8fb] via-40% to-[#a960c1] to-90%" />
      </div>
    </div>
    <form @submit.prevent="createNewChat">
      <textarea id="textarea" v-model="input" @input="autoResize" @keyup.enter.exact.prevent="createNewChat"
        :placeholder="$t('Ask anything')" :disabled="isSending"></textarea>
      <div class="flex justify-between items-center">
        <div>
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
import { useChatStore } from '../../stores/chat'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const chat = useChatStore()
const router = useRouter()
const input = ref('')
const isSending = ref(false)

function autoResize() {
  const textarea = document.getElementById('textarea');
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}


const createNewChat = async () => {
  if (!input.value || isSending.value) return
  isSending.value = true

  try {
    const newConv = await chat.CreateConversation(input.value, chat.selectedModel)
    if (newConv?.conversation_id) {
      router.push(`/chat/${newConv.conversation_id}`)
    }
    input.value = ''
  } catch (err) {
    console.error('Failed to create conversation:', err)
  } finally {
    isSending.value = false
  }
}

</script>
