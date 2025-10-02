<template>
  <div class="chat-box">
    <!-- الرسائل -->
    <div class="messages" ref="messagesContainer" @scroll="checkScroll">
      <div v-for="m in messages" :key="m.id" :class="m.role === 'user' ? 'text-right' : 'text-left'">
        <!-- رسالة البوت / Markdown -->
        <div v-if="m.role === 'assistant'" v-html="md.render(m.content)" class="bot-message prose max-w-none">
        </div>

        <!-- رسالة المستخدم -->
        <span v-else class="bg-blue-500 text-white px-3 py-2 rounded-lg inline-block mt-3 mb-3">
          {{ m.content }}
        </span>
      </div>
      <!-- زر Thinking يظهر مرة واحدة -->
      <div v-if="Thinking" class="text-left mt-2">
        <UButton label="Thinking..." variant="link" color="neutral" class="p-0" loading />
      </div>
    </div>
    <UButton v-if="showScrollButton" icon="i-lucide-arrow-down"
      class="absolute bottom-20 right-4 rounded-full shadow-lg" color="neutral" @click="scrollToBottom(true)" />
    <!-- الفورم -->
    <form @submit.prevent="sendMessage">
      <textarea id="textarea" v-model="input" @input="autoResize" @keyup.enter.exact.prevent="sendMessage"
        :placeholder="$t('Ask anything')" :disabled="isSending"></textarea>
      <div class="flex justify-between items-center">
        <div>
          <UDropdownMenu :items="[[{
            label: 'Upload Files',
            icon: 'akar-icons:attach',
            onSelect: () => onDeleteConversation(conv.id)
          }]]" :ui="{ content: 'w-48' }">
            <UTooltip class="me-1" :delay-duration="0" text="Add Files">
              <UButton color="neutral" variant="ghost" icon="iconamoon:sign-plus-bold" />
            </UTooltip>
          </UDropdownMenu>
          <UDropdownMenu :items="[[{
            label: 'Upload Files',
            icon: 'akar-icons:attach',
            onSelect: () => onDeleteConversation(conv.id)
          }]]" :ui="{ content: 'w-48' }">
            <UTooltip class="me-1" :delay-duration="0" text="Models">
              <UButton color="neutral" variant="ghost" icon="material-symbols:page-info-rounded" />
            </UTooltip>
          </UDropdownMenu>
        </div>
        <button class="send" :class="input == '' || isSending ? 'empty' : ''" type="submit" :disabled="isSending">
          <UIcon name="majesticons:arrow-up" class="text-xl" />
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { useChatStore } from '../../../stores/chat'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const route = useRoute()
const conversationId = route.params.id
const chat = useChatStore()
const auth = useAuthStore()
const config = useRuntimeConfig()

const input = ref('')
const messages = computed(() => chat.getMessages(conversationId))
const textarea = ref < HTMLTextAreaElement | null > (null)


function autoResize() {
  const textarea = document.getElementById('textarea');
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

// Markdown parser مع كود و copy button
const md = new MarkdownIt({
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code><button class="copy-btn" data-code="${encodeURIComponent(str)}">Copy</button></pre>`
      } catch {
        // fallback لو صار خطأ
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})
const messagesContainer = ref(null)
const showScrollButton = ref(false)
// Scroll سلس عند الرسائل الجديدة
const scrollToBottom = (instant = false) => {
  const container = messagesContainer.value
  if (!container) return
  requestAnimationFrame(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: instant ? 'auto' : 'smooth'
    })
  })
}
// تحقق إذا المستخدم مو بالنهاية
const checkScroll = () => {
  const container = messagesContainer.value
  if (!container) return
  const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50
  showScrollButton.value = !nearBottom
}
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
})
const Thinking = ref('')
const sendMessage = async () => {
  if (!input.value.trim()) return
  Thinking.value = 'Thinking'
  const userInput = input.value
  input.value = ''

  // أضف رسالة المستخدم مباشرة
  chat.addMessage(conversationId, {
    id: Date.now(),
    role: 'user',
    content: userInput
  })

  // Placeholder لرسالة البوت
  const botMessageId = crypto.randomUUID()
  chat.addMessage(conversationId, {
    id: botMessageId,
    role: 'assistant',
    content: '' // placeholder فارغ
  })
  scrollToBottom()

  try {
    const { data } = await useFetch(`${config.public.apiBase}/chat/gemini/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        message: userInput,
        conversation_id: conversationId
      }
    })

    if (data.value?.response) {
      Thinking.value = ''
      // أضف المحتوى تدريجيًا (streaming effect)
      const fullText = data.value.response
      let currentText = ''
      for (let i = 0; i < fullText.length; i++) {
        currentText += fullText[i]
        const msg = chat.getMessages(conversationId).find(m => m.id === botMessageId)
        if (msg) msg.content = currentText
        await nextTick()
        scrollToBottom()
        await new Promise(r => setTimeout(r, 5)) // سرعة الطباعة
      }
    }
  } catch (err) {
    console.error('Send message failed:', err)
  }
}

onMounted(async () => {
  try {
    await chat.GetMessagesApi(conversationId)
    // انتظر Vue تحدث الـ DOM
    await nextTick() // nextTick إضافي للتأكد من render كامل للرسائل
    // Scroll بعد التأكد من DOM جاهز
    requestAnimationFrame(() => {
      scrollToBottom()
    })

  } catch (err) {
    console.error('Failed to load conversation messages:', err)
  }

  // copy buttons
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('copy-btn')) {
      const btn = e.target
      const code = decodeURIComponent(btn.dataset.code)
      try {
        await navigator.clipboard.writeText(code)
        btn.textContent = 'Copied!'
        btn.disabled = true
        btn.classList.add('copied')
        setTimeout(() => {
          btn.textContent = 'Copy'
          btn.disabled = false
          btn.classList.remove('copied')
        }, 2000)
      } catch (err) {
        console.error('Copy failed', err)
      }
    }
  })
})

</script>

<style>
.messages {
  max-height: 70vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 10px;
}

/* Markdown / code block */
.hljs {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 12px;
  border-radius: 6px;
  position: relative;
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.copy-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #444;
  color: #fff;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.copy-btn:hover {
  background: #666;
}
</style>
