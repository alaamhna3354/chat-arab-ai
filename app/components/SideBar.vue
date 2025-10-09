<template>
    <aside class="side-bar" :class="locale">
        <!-- Logo -->
        <div>
            <div class="head">
                <div class="logo">
                    <NuxtLink to="/">
                        <img width="30" height="30" src="../assets/img/logo-blue.png" alt=""></img>
                    </NuxtLink>
                    <UIcon @click="emit('toggle-sidebar')" name="streamline-plump:book-1-solid" :class="locale"
                        class="rotate hover-open-sidebar size-5 text-[#999]" />

                </div>
                <button class="hide-close" :class="locale" @click="emit('toggle-sidebar')">
                    <UIcon name="iconamoon:close" class="size-8 text-[#999]" />
                </button>
            </div>
            <NuxtLink to="/">
                <button class="chats-but">
                    <UIcon name="streamline-plump-color:ai-edit-robot-flat" class="size-5" />
                    <span class="hide-close ms-2">
                        {{ $t('New chat') }}
                    </span>
                </button>
            </NuxtLink>
            <!-- Search Chat -->
            <button class="chats-but" @click="onSearch">
                <UIcon name="flat-color-icons:search" class="size-5" />
                <span class="ms-2 hide-close">{{ $t('Search chats') }}</span>
            </button>
        </div>

        <!-- New Chat -->

        <!-- Chat History -->
        <div class="hide-close mt-5" v-if="chat.AllConversations.length > 0">
            <div style="color: #8f8f8f;font-weight: 500;">{{ $t("Chats") }}</div>
            <ul class="chats-list">
                <li v-for="conv in chat.AllConversations" :key="conv.id">
                    <NuxtLink :to="`/chat/${conv.id}`">
                        <button class="chats-but conversation-item">
                            <span> {{ conv.title || '' }}</span>
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

        <UDropdownMenu class="footer" v-if="auth.user" :items="UserDropDown" :ui="{
            content: 'w-48'
        }">
            <button class="chats-but">
                <UAvatar :alt="auth.user.name" size="md" />
                <span class="ms-2 hide-close text-md font-semibold">{{ auth.user.name }}</span>
            </button>
        </UDropdownMenu>


    </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import { useI18n } from 'vue-i18n'
import { useToast, useOverlay } from '#imports'
// المودالات
import SearchChats from './Modals/SearchChats.vue'
import LogoutModal from './Modals/LogoutModal.vue'
import DeleteConversation from './Modals/DeleteConversation.vue'
// stores
const auth = useAuthStore()
const chat = useChatStore()

// state
const loading = ref(true)
const count = ref(0)
const toast = useToast()

onMounted(async () => {
    if (auth.isAuthenticated) {
        try {
            await chat.GetConversation()
        } finally {
            loading.value = false
        }
    }
})

const emit = defineEmits(['toggle-sidebar'])
const { t,locale } = useI18n()

// دالة المساعدة
const overlay = useOverlay()

function useModalConfirm(component: any) {
    const modal = overlay.create(component)

    return async (props: Record<string, any> = {}) => {
        const instance = modal.open(props)
        return await instance.result
    }
}

// مودالات
const confirmSearch = useModalConfirm(SearchChats)
const confirmLogout = useModalConfirm(LogoutModal)
const confirmDelete = useModalConfirm(DeleteConversation)

// أكشنات
async function onSearch() {
    await confirmSearch({ conversations: chat.AllConversations })
}

async function onLogout() {
    const confirmed = await confirmLogout({ count: count.value })
    if (confirmed) {
        auth.logout()
        chat.AllConversations = []
        chat.conversations = {}
        chat.Messages = []
        toast.add({ title: 'Logged out successfully', color: 'neutral' })
    }
}

async function onDeleteConversation(convId: number,convTitle:string) {
    const confirmed = await confirmDelete({convTitle})
    if (confirmed) {
        await chat.DeleteConversation(convId)
        toast.add({ title: 'Conversation deleted', color: 'neutral',duration:2000 })
    }
}

// Dropdown items
import type { DropdownMenuItem } from '@nuxt/ui'
import { useUiStore } from '../composables/useUiStore'
const ui = useUiStore()

const UserDropDown = ref<DropdownMenuItem[][]>([
    [
        {
            label: auth.user?.name ?? '',
            type: 'label'
        }
    ],
    [
        { label: t('Profile'), icon: 'i-lucide-user', onSelect: () => ui.openProfileDrawer() },
        { label: t('Settings'), icon: 'i-lucide-cog' },
    ],
    [
        {
            label: t('Log out'),
            icon: 'i-lucide-log-out',
            onSelect: onLogout
        }
    ]
])

</script>