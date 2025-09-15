<template>
  <div class="chat-box">
    <div>
      <div v-for="m in messages" :key="m.id" :class="m.role === 'user' ? 'text-right' : 'text-left'">
        <span :class="m.role === 'user'
          ? 'bg-blue-500 text-white px-3 py-2 rounded-lg inline-block'
          : 'bg-gray-200 px-3 py-2 rounded-lg inline-block'">
          {{ m.text }}
        </span>
      </div>
    </div>

    <form>
      <input v-model="input" @keyup.enter="sendMessage" :placeholder="$t('Ask anything')" />
      <button class="send" :class="input == '' ? 'empty' : ''" @click="sendMessage">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="#000" xmlns="http://www.w3.org/2000/svg" class="icon">
          <path
            d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z">
          </path>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"

const config = useRuntimeConfig()
const messages = ref([])
const input = ref("")

const sendMessage = async () => {
  if (!input.value) return

  // أضف رسالة المستخدم
  messages.value.push({ id: Date.now(), role: "user", text: input.value })

  // ابعت للـ API
  const { data } = await useFetch(`${config.public.apiBase}/chat`, {
    method: "POST",
    body: { message: input.value }
  })

  // أضف رد السيرفر
  if (data.value?.reply) {
    messages.value.push({
      id: Date.now() + 1,
      role: "bot",
      text: data.value.reply
    })
  }

  input.value = ""
}
</script>
<style lang="scss" scoped>
.chat-box {
  display: grid;
  place-content: center;

  form {
    padding: 10px 20px;
    border-radius: 25px;
    border: 1px solid #d6d6d6;
    background-color: #fff;
    width: 700px;
    display: flex;
    align-items: center;

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
        opacity: .4;
        background-color: #21221f;
      }
    }
  }
}
</style>