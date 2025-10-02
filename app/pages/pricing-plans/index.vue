<script setup lang="ts">
definePageMeta({
  layout: 'empty',
})
const plans = ref([
  {
    title: 'Free',
    description: 'Intelligence for everyday tasks.',
    price: '$0',
    features: [
      'One developer',
      'Lifetime access'
    ],
    button: {
      label: 'Buy now',
      color: 'neutral'
    }
  },
  {
    title: 'Plus',
    description: 'More access to advanced intelligence.',
    price: '$21',
    features: [
      'Up to 5 developers',
      'Everything in Solo'
    ],
    button: {
      label: 'Buy now',
      color: 'neutral'
    }
  },
  {
    title: 'Pro',
    description: 'Full access to the best of ChatGPT & Gemini.',
    price: '$240',
    features: [
      'Up to 20 developers',
      'Everything in Startup'
    ],
    button: {
      label: 'Buy now',
      color: 'neutral'
    }
  }
])
</script>

<template>
  <UContainer>
    <h1 class="text-2xl text-center pt-5">Upgrade your plan</h1>
    <UPricingPlans class="mt-10" :plans="plans" />
    <NuxtLink to="/" class="btn flex content-center">
      <UButton class="btn btn-secondary m-auto mt-5" color="neutral">
        Back to Home
      </UButton>

    </NuxtLink>
  </UContainer>
</template>
