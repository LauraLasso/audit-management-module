<template>
  <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', cfg.cls]">
    {{ cfg.label }}
  </span>
</template>

<script setup lang="ts">
import type { Priority } from '~/types'

const props = defineProps<{ priority: Priority }>()

const MAP: Record<Priority, { label: string; cls: string }> = {
  HIGH: { label: 'Alta', cls: 'bg-red-100 text-red-700' },
  MEDIUM: { label: 'Media', cls: 'bg-yellow-100 text-yellow-700' },
  LOW: { label: 'Baja', cls: 'bg-green-100 text-green-700' }
}

const cfg = computed(() => MAP[props.priority])
</script>
