<template>
    <header>
        <UIcon @click="emit('toggle-sidebar')" name="heroicons:bars-3-center-left-16-solid" :class="locale"
            class="open-side-bar size-6 text-[#999] cursor-pointer" />
        <NuxtLink to="/" class="logo">
            <img width="100" height="100" src="../assets/img/logo.png" alt="">
        </NuxtLink>
        <ClientOnly>
            <NuxtLink v-if="!auth.isAuthenticated" class="btn btn-main" to="/login">{{ $t('Log in') }}</NuxtLink>
            <NuxtLink v-if="!auth.isAuthenticated" class="btn btn-secondary signup-link" to="/signup">{{ $t('Sign up')
                }}</NuxtLink>
            <NuxtLink v-if="auth.isAuthenticated" to="/pricing-plans">
                <UButton class="btn btn-secondary" icon="i-lucide-rocket" color="neutral" variant="ghost" :ui="{
                    leadingIcon: 'text-info'
                }">
                    {{ $t('Upgrade') }}
                </UButton>
            </NuxtLink>

        </ClientOnly>
        <div class="languages" @click="toggleLocale">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor"
                    d="M12 22q-2.05 0-3.875-.788t-3.187-2.15t-2.15-3.187T2 12q0-2.075.788-3.887t2.15-3.175t3.187-2.15T12 2q2.075 0 3.888.788t3.174 2.15t2.15 3.175T22 12q0 2.05-.788 3.875t-2.15 3.188t-3.175 2.15T12 22m0-2.05q.65-.9 1.125-1.875T13.9 16h-3.8q.3 1.1.775 2.075T12 19.95m-2.6-.4q-.45-.825-.787-1.713T8.05 16H5.1q.725 1.25 1.813 2.175T9.4 19.55m5.2 0q1.4-.45 2.488-1.375T18.9 16h-2.95q-.225.95-.562 1.838T14.6 19.55M4.25 14h3.4q-.075-.5-.112-.987T7.5 12t.038-1.012T7.65 10h-3.4q-.125.5-.187.988T4 12t.063 1.013t.187.987m5.4 0h4.7q.075-.5.113-.987T14.5 12t-.038-1.012T14.35 10h-4.7q-.075.5-.112.988T9.5 12t.038 1.013t.112.987m6.7 0h3.4q.125-.5.188-.987T20 12t-.062-1.012T19.75 10h-3.4q.075.5.113.988T16.5 12t-.038 1.013t-.112.987m-.4-6h2.95q-.725-1.25-1.812-2.175T14.6 4.45q.45.825.788 1.713T15.95 8M10.1 8h3.8q-.3-1.1-.775-2.075T12 4.05q-.65.9-1.125 1.875T10.1 8m-5 0h2.95q.225-.95.563-1.838T9.4 4.45Q8 4.9 6.912 5.825T5.1 8" />
            </svg>

            <span>{{ currentLocale?.code }}</span>
        </div>
    </header>
</template>

<script setup>
import { computed } from 'vue'
const { locale, locales, setLocale } = useI18n()
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()

const emit = defineEmits(['toggle-sidebar'])
// بدل show و dropdown، نعمل دالة لتبديل اللغة مباشرة
const toggleLocale = () => {
    // لنبدل للغة الثانية مباشرة
    const currentIndex = locales.value.findIndex(l => l.code === locale.value)
    const nextIndex = (currentIndex + 1) % locales.value.length
    setLocale(locales.value[nextIndex].code)
}

// اسم اللغة الحالية
const currentLocale = computed(() =>
    locales.value.find((l) => l.code === locale.value)
)
</script>
<style lang="scss">
header {
    display: flex;
    align-items: center;
    gap: 1rem;
    .open-side-bar {
        @media (min-width:768px) {
            display: none;
        }
    }

    .logo {
        margin-inline-end: auto;

        span {
            background: linear-gradient(to right,
                    /* use the variables in a gradient (or wherever!) */
                    hsl(210 100% 59%),
                    hsl(310 100% 59%));

            /* old browser support */
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;

            /* modern browser version */
            background-clip: text;
            color: transparent;
        }
    }

    .signup-link {
        @media (max-width:768px) {
            display: none;
        }
    }

    .languages {
        display: flex;
        align-items: center;
        position: relative;
        cursor: pointer;
        margin-inline-start: 0.2rem;

        span {
            margin-inline-start: 0.2rem;
        }
    }

}
</style>
