<template>
  <div class="chat-box">
    <!-- الرسائل -->
    <div class="messages">
      <div
        v-for="m in messages"
        :key="m.id"
        :class="m.role === 'user' ? 'text-right' : 'text-left'"
      >
        <!-- إذا بوت → اعرض Markdown -->
        <div
          v-if="m.role === 'bot'"
          v-html="md.render(m.text)"
          class="bot-message prose max-w-none"
        ></div>

        <!-- إذا يوزر → نص عادي -->
        <span
          v-else
          class="bg-blue-500 text-white px-3 py-2 rounded-lg inline-block"
        >
          {{ m.text }}
        </span>
      </div>
    </div>

    <!-- الفورم -->
    <form @submit.prevent="sendMessage">
      <input
        v-model="input"
        @keyup.enter="sendMessage"
        :placeholder="$t('Ask anything')"
      />
      <button
        class="send"
        :class="input == '' ? 'empty' : ''"
        type="submit"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="#000"
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
        >
          <path
            d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"
          ></path>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick,computed } from "vue"
import { useChatStore } from "../../stores/chat"
import MarkdownIt from "markdown-it"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"

const props = defineProps({
  conversationId: {
    type: String,
    required: true
  }
})

const chat = useChatStore()
const config = useRuntimeConfig()
const input = ref("")
// const messages = computed(() => chat.getMessages(props.conversationId))
const messages = ref([
  { id: 1, role: "user", text: "Hello, can you show me some code?" },
  {
    id: 2,
    role: "bot",
    text: `Here is a simple **JavaScript** function:

\`\`\`js
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Alaa"));
\`\`\`
`
  }
])


// Markdown parser
const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `
        <pre class="hljs">
          <code>${hljs.highlight(str, { language: lang }).value}</code>
          <button class="copy-btn" data-code="${encodeURIComponent(str)}">Copy</button>
        </pre>`
      } catch {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// Event delegation for copy buttons
onMounted(() => {
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("copy-btn")) {
      const btn = e.target
      const code = decodeURIComponent(btn.dataset.code)

      try {
        await navigator.clipboard.writeText(code)
        btn.textContent = "Copied!"
        btn.disabled = true
        btn.classList.add("copied")

        setTimeout(() => {
          btn.textContent = "Copy"
          btn.disabled = false
          btn.classList.remove("copied")
        }, 2000)
      } catch (err) {
        console.error("Copy failed", err)
      }
    }
  })
})

const sendMessage = async () => {
  if (!input.value) return

  // أضف رسالة المستخدم
  chat.addMessage(props.conversationId, {
    id: Date.now(),
    role: "user",
    text: input.value
  })

  const userInput = input.value
  input.value = ""

  const { data } = await useFetch(`${config.public.apiBase}/chat`, {
    method: "POST",
    body: { message: userInput }
  })

  if (data.value?.reply) {
    messages.value.push({
      id: Date.now() + 1,
      role: "bot",
      text: data.value.reply
    })
    await nextTick()
  }
}
</script>

<style lang="scss" scoped>
.chat-box {
  display: grid;

  .messages {
    overflow-y: auto;
    padding: 20px;
    margin-top: 25px;
    scrollbar-width: none;
    width: 80%;
    max-height: 100vh;
    justify-self: center;
  }

  form {
    margin-top: 10px;
    padding: 10px 20px;
    border-radius: 25px;
    border: 1px solid #d6d6d6;
    background-color: #fff;
    width: 700px;
    display: flex;
    align-items: center;
    justify-self: center;

    input {
      font-size: 16px;
      font-weight: 500;
      outline: none;
      border: none;
      height: 100%;
      flex: 1;
      background-color: transparent;

      &::placeholder {
        color: #6c6c6c;
      }
    }

    .send {
      border: none;
      cursor: pointer;
      border-radius: 50%;
      background-color: #21221f;
      width: 36px;
      height: 36px;
      display: grid;
      place-content: center;

      svg {
        fill: #fff;
      }

      &.empty {
        background-color: transparent;
        cursor: no-drop;
        opacity: 0.4;
        background-color: #21221f;
      }
    }
  }
}


</style>
<style>
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
