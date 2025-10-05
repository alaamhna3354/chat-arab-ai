<template>
  <div class="chat-box">
    <!-- الرسائل -->
    <div class="messages" ref="messagesContainer" @scroll="checkScroll">
      <div v-for="m in messages" :key="m.id" :class="m.role === 'user' ? 'text-right' : 'text-left'">
        <!-- رسالة البوت / Markdown -->
        <div v-if="m.role === 'assistant'" v-html="md.render(m.content)" class="bot-message prose max-w-none"></div>

        <!-- رسالة المستخدم -->
        <span v-else class="bg-blue-500 text-white px-3 py-2 rounded-lg inline-block mt-3 mb-3">
          {{ m.content }}
        </span>
      </div>

      <!-- زر Thinking -->
      <div v-if="isStreaming" class="text-left mt-2">
        <UButton label="Thinking..." variant="link" color="neutral" class="p-0" loading />
      </div>
    </div>

    <!-- زر النزول للأسفل -->
    <UButton v-if="showScrollButton" icon="i-lucide-arrow-down"
      class="absolute bottom-20 right-4 rounded-full shadow-lg" color="neutral" @click="scrollToBottom(true)" />

    <!-- الفورم -->
    <form @submit.prevent="sendMessage">
      <textarea id="textarea" v-model="newMessage" @input="autoResize" @keyup.enter.exact.prevent="sendMessage"
        :placeholder="$t('Ask anything')" :disabled="isStreaming"></textarea>

      <div class="flex justify-between items-center">
        <div>
          <UDropdownMenu :items="[[{ label: 'Upload Files', icon: 'akar-icons:attach' }]]" :ui="{ content: 'w-48' }">
            <UTooltip class="me-1" :delay-duration="0" text="Add Files">
              <UButton color="neutral" variant="ghost" icon="iconamoon:sign-plus-bold" />
            </UTooltip>
          </UDropdownMenu>
          <UDropdownMenu :items="[[{ label: 'Models', icon: 'material-symbols:page-info-rounded' }]]"
            :ui="{ content: 'w-48' }">
            <UTooltip class="me-1" :delay-duration="0" text="Models">
              <UButton color="neutral" variant="ghost" icon="material-symbols:page-info-rounded" />
            </UTooltip>
          </UDropdownMenu>
        </div>
        <button v-if="isStreaming" class="stop" @click="stopStreaming">
          <UIcon name="i-lucide-square" class="text-xl" />
        </button>
        <button v-else class="send" :class="newMessage == '' || isStreaming ? 'empty' : ''" type="submit"
          :disabled="isStreaming">
          <UIcon name="majesticons:arrow-up" class="text-xl" />
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../../../stores/chat'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

// ----------------------
// الإعدادات الأساسية
// ----------------------
const route = useRoute()
const conversationId = route.params.id
const chat = useChatStore()

// ----------------------
// Markdown مع تظليل الكود و copy button
// ----------------------
const md = new MarkdownIt({
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value
          }</code><button class="copy-btn" data-code="${encodeURIComponent(
            str
          )}">Copy</button></pre>`
      } catch {
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// ----------------------
// الحالة
// ----------------------
const newMessage = ref('')
const messages = computed(() => chat.getMessages(conversationId))
const messagesContainer = ref(null)
const showScrollButton = ref(false)
const isStreaming = ref(false)
const currentStreamText = ref('')
let currentStream = null

// ----------------------
// Auto resize textarea
// ----------------------
function autoResize() {
  const textarea = document.getElementById('textarea')
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

// ----------------------
// Scroll
// ----------------------
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

const checkScroll = () => {
  const container = messagesContainer.value
  if (!container) return
  const nearBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 50
  showScrollButton.value = !nearBottom
}

watch(messages, async () => {
  await nextTick()
  scrollToBottom()
})

// ----------------------
// إرسال الرسالة
// ----------------------
const sendMessage = async () => {
  if (!newMessage.value.trim() || isStreaming.value) return

  const userMessage = newMessage.value
  newMessage.value = ''

  // أضف رسالة المستخدم
  chat.addMessage(conversationId, {
    id: Date.now(),
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  })

  // أضف رسالة البوت الفارغة (placeholder)
  const botMessageId = crypto.randomUUID()
  chat.addMessage(conversationId, {
    id: botMessageId,
    role: 'assistant',
    content: ''
  })

  scrollToBottom()
  isStreaming.value = true
  currentStreamText.value = ''

  // ----------------------
  // استدعاء streamChat من store
  // ----------------------
  currentStream = chat.streamChat(userMessage, conversationId, 'gemini', {
    onStart: () => {
      console.log('🚀 Stream started')
    },

    onChunk: (text) => {
      currentStreamText.value += text
      const msg = chat.getMessages(conversationId).find(
        (m) => m.id === botMessageId
      )
      if (msg) msg.content = currentStreamText.value
      scrollToBottom()
    },

    onComplete: () => {
      isStreaming.value = false
      currentStream = null
      scrollToBottom()
    },

    onError: (error) => {
      console.error('❌ Stream error:', error)
      isStreaming.value = false
      currentStream = null
      scrollToBottom()
      chat.addMessage(conversationId, {
        id: Date.now(),
        role: 'system',
        content: `Error: ${error}`,
        timestamp: new Date()
      })
    }
  })
}

// ----------------------
// تحميل الرسائل عند الدخول
// ----------------------
onMounted(async () => {
  try {
    await chat.GetMessagesApi(conversationId)
    await nextTick()
    requestAnimationFrame(scrollToBottom)
  } catch (err) {
    console.error('Failed to load messages:', err)
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

// ----------------------
// تنظيف عند مغادرة الصفحة
// ----------------------
const stopStreaming = () => {
  if (currentStream?.abort) {
    currentStream.abort()
  }

  isStreaming.value = false
  currentStream = null
}
onUnmounted(() => {
  stopStreaming()
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
