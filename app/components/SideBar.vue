<template>
    <aside class="side-bar" :class="locale">
        <!-- Logo -->
        <div>
            <div class="head">
                <div class="logo">
                    <NuxtLink to="/">
                        <img width="30" height="30" src="../assets/img/logo-icon.png" alt=""></img>
                    </NuxtLink>
                    <UIcon @click="emit('toggle-sidebar')" name="streamline-plump:book-1-solid" :class="locale"
                        class="rotate hover-open-sidebar size-5 text-[#999]" />

                </div>
                <button class="hide-close rotate" :class="locale" @click="emit('toggle-sidebar')">
                    <UIcon name="streamline-plump:book-1-solid" class="size-5 text-[#999]" />
                </button>
            </div>
            <button class="chats-but">
                <UIcon name="fa-solid:plus-square" class=" size-4 text-[#21221f]" />
                <span class="hide-close ms-2">
                    {{ $t('New chat') }}
                </span>
            </button>
            <!-- Search Chat -->
            <button class="chats-but">
                <UIcon name="fa-solid:search-plus" class="size-4 text-[#21221f]" />
                <span class="ms-2 hide-close">{{ $t('Search chats') }}</span>
            </button>
        </div>

        <!-- New Chat -->

        <!-- Chat History -->
        <div class="hide-close">
            <div style="color: #8f8f8f;font-weight: 500;">{{ $t("Chats") }}</div>
            <ul>
                <li v-for="chat in chats" :key="chat.id">
                    <button class="chats-but">
                        {{ chat.title }}
                    </button>
                </li>
            </ul>
        </div>

        <UDropdownMenu v-if="auth.user" :items="items" :ui="{
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
import { ref } from "vue"
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()
const emit = defineEmits(['toggle-sidebar'])
const { locale } = useI18n()

const chats = ref([
    { id: 1, title: "نصائح العمل مع Node.js" },
    { id: 2, title: "مواقع لاختيار ألوان متناسقة" },
    { id: 3, title: "Pug to HTML conversion" },
])
// user DropDown
import type { DropdownMenuItem } from '@nuxt/ui'

const items = ref<DropdownMenuItem[][]>([
    [
        {
            label: auth.user?.name ?? '',
            avatar: {
                src: ''
            },
            type: 'label'
        }
    ],
    [
        {
            label: 'Profile',
            icon: 'i-lucide-user'
        },
        {
            label: 'Settings',
            icon: 'i-lucide-cog',
        },
    ],
    [
        {
            label: 'Logout',
            icon: 'i-lucide-log-out',
            onSelect() {
                open()
    }

        }
    ]
])
import  LogoutModal  from './LogoutModal.vue';

const count = ref(0)

const toast = useToast()
const overlay = useOverlay()

const modal = overlay.create(LogoutModal)

async function open() {
  const instance = modal.open({
    count: count.value
  })

  const shouldIncrement = await instance.result

  if (shouldIncrement) {
    count.value++

    toast.add({
      title: `Log out Success`,
      color: 'success',
      id: 'modal-success'
    })

    // Update the count
    modal.patch({
      count: count.value
    })
    return
  }

}
</script>