<template>
    <UModal>
        <template #header>
            <UInput v-model="searchQuery" class="w-full" type="search" color="neutral" variant="none"
                :placeholder="$t('Search chats')" />
        </template>
        <template #body>
            <NuxtLink class="chat-item mb-2" to="/" @click="emit('close', false)">
                <UIcon name="cuida:edit-outline" class=" size-5 text-[#21221f]" />
                <span class="hide-close ms-2">
                    {{ $t('New chat') }}
                </span>
            </NuxtLink>
            <div v-for="(convs, category) in filteredConversations" :key="category">
                <h3 class="text-xs text-slate-500" v-if="convs.length">{{ category }}</h3>
                <ul>
                    <li class="mt-1 mb-3" v-for="conv in convs" :key="conv.id">
                        <NuxtLink class="chat-item" :to="`/chat/${conv.id}`" @click="emit('close', false)">
                            <UIcon class="me-2 size-5" name="fluent:chat-24-regular" />
                            {{ conv.title }}
                        </NuxtLink>
                    </li>
                </ul>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const emit = defineEmits<{ close: [boolean] }>()
interface Conversation {
    id: number | string
    title: string
    created_at: string
    [key: string]: any
}

const props = defineProps<{ conversations: Conversation[] }>()

const searchQuery = ref('')

// نفس الكود لتصنيف المحادثات
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const keys = {
    today: t('Today'),
    yesterday: t('Yesterday'),
    lastWeek: t('Last Week'),
    lastMonth: t('Last Month'),
    older: t('Older')
}
const categorizedConversations = computed(() => {
  const now = new Date()
  const categories: Record<string, Conversation[]> = {
    [keys.today]: [],
    [keys.yesterday]: [],
    [keys.lastWeek]: [],
    [keys.lastMonth]: [],
    [keys.older]: []
  }

  props.conversations.forEach((conv: Conversation) => {
    const date = new Date(conv.created_at)
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) categories[keys.today].push(conv)
    else if (diffDays === 1) categories[keys.yesterday].push(conv)
    else if (diffDays <= 7) categories[keys.lastWeek].push(conv)
    else if (diffDays <= 30) categories[keys.lastMonth].push(conv)
    else categories[keys.older].push(conv)
  })

  // ترتيب كل مجموعة من الأحدث للأقدم
  Object.values(categories).forEach(convs => {
    convs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })

  return categories
})

// computed للفلترة حسب البحث
const filteredConversations = computed(() => {
    if (!searchQuery.value) return categorizedConversations.value

    const filtered: Record<string, Conversation[]> = {
        Today: [],
        Yesterday: [],
        'Last Week': [],
        'Last Month': [],
        OLDER: []
    }

    Object.entries(categorizedConversations.value).forEach(([category, convs]) => {
        filtered[category] = convs.filter(conv =>
            conv.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    })

    return filtered
})
</script>

<style scoped lang="scss">
.chat-item {
    background-color: transparent;
    border: none;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    transition: .3s;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #eeecec;
    }

}
</style>