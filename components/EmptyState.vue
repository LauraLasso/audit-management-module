<template>
  <div class="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
      <i :class="['pi', icon ?? 'pi-inbox', 'text-2xl text-gray-400']" />
    </div>
    <div>
      <p class="font-semibold text-gray-700 text-lg">
        {{ title }}
      </p>
      <p v-if="description" class="text-gray-500 text-sm mt-1">
        {{ description }}
      </p>
    </div>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{ icon?: string; title: string; description?: string }>()
</script>
