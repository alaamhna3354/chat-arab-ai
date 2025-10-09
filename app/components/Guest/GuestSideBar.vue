
<template>
  <aside class="side-bar" :class="locale">
    <!-- Logo -->
    <div>
      <div class="head">
        <div class="logo">
          <NuxtLink to="/guest">
            <img width="30" height="30" src="../../assets/img/logo-blue.png" alt=""></img>
          </NuxtLink>
          <UIcon @click="emit('toggle-sidebar')" name="streamline-plump:book-1-solid" :class="locale"
            class="rotate hover-open-sidebar size-5 text-[#999]" />

        </div>
        <button class="hide-close" :class="locale" @click="emit('toggle-sidebar')">
          <UIcon name="iconamoon:close" class="size-8 text-[#999]" />
        </button>
      </div>
      <button class="chats-but" @click="createNewChat">
        <UIcon name="streamline-plump-color:ai-edit-robot-flat" class="size-5" />
        <span class="hide-close ms-2">
          {{ $t('New chat') }}
        </span>
      </button>
    </div>

    <!-- Chat History -->
    <div class="hide-close mt-5" v-if="guestChat.getAllConversations().length > 0">
      <div style="color: #8f8f8f;font-weight: 500;">{{ $t("Recent Chats") }}</div>
      <ul class="chats-list">
        <li v-for="conv in guestChat.getAllConversations()" :key="conv.id">
          <NuxtLink :to="`/guest-chat/${conv.id}`">
            <button class="chats-but conversation-item">
              <span>{{ conv.title || 'New Chat' }}</span>
              <UDropdownMenu :items="[[{
                label: 'Delete',
                color: 'error',
                icon: 'i-lucide-trash',
                onSelect: () => onDeleteConversation(conv.id,conv.title)
              }]]" :ui="{ content: 'w-48' }">
                <UButton color="neutral" variant="ghost" icon="pepicons-pencil:dots-x" />
              </UDropdownMenu>
            </button>
          </NuxtLink>
        </li>
      </ul>
    </div>

  </aside>
</template>
<script setup lang="ts">
import { useGuestChatStore } from '../../../stores/guestChat'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
// import { useToast } from '#imports'

// المودالات - مؤقتاً معطلة للضيوف
// import SearchChats from './Modals/SearchChats.vue'
// import DeleteConversation from './Modals/DeleteConversation.vue'

// stores
const guestChat = useGuestChatStore()

// state - toast مؤقتاً معطل
// const toast = useToast()

const emit = defineEmits(['toggle-sidebar'])

const { locale } = useI18n()

import DeleteConversation from '../Modals/DeleteConversation.vue'
const overlay = useOverlay()
const toast = useToast()

function useModalConfirm(component: any) {
    const modal = overlay.create(component)

    return async (props: Record<string, any> = {}) => {
        const instance = modal.open(props)
        return await instance.result
    }
}
const confirmDelete = useModalConfirm(DeleteConversation)
async function onDeleteConversation(convId: string,convTitle:string) {

  const confirmed = await confirmDelete({convTitle})
    if (confirmed) {
        guestChat.deleteConversation(convId)
        toast.add({ title: 'Conversation deleted', color: 'neutral',duration:2000 })
        if (route.params.id == convId) {
          router.push('/guest')
        }
    }
}

function createNewChat() {
  // إنشاء محادثة جديدة والانتقال للصفحة الرئيسية
  guestChat.createGuestConversation()
}
// Props
defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.new-chat-btn,
.search-btn {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.new-chat-btn:hover,
.search-btn:hover {
  background: #0056b3;
}

.search-btn {
  background: #6c757d;
}

.search-btn:hover {
  background: #545b62;
}

.guest-notice {
  padding: 1rem;
  margin: 1rem;
}

.chats-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.chats-list li {
  margin-bottom: 0.25rem;
}

.conversation-item {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s;
  text-align: left;
}

.conversation-item:hover {
  background: #e9ecef;
}

.footer {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
}

.guest-actions {
  display: flex;
  flex-direction: column;
}

.hide-close {
  display: block;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .hide-close {
    display: none;
  }
}
</style>
