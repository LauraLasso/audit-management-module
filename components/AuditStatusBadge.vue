<template>
  <span :class="['inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold', cfg.cls]">
    <span :class="['w-1.5 h-1.5 rounded-full', cfg.dot]" />
    {{ cfg.label }}
  </span>
</template>

<script setup lang="ts">
import type { AuditStatus } from '~/types'

const props = defineProps<{ status: AuditStatus }>()

const MAP: Record<AuditStatus, { label: string; cls: string; dot: string }> = {
  DRAFT: { label: 'Borrador', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  IN_PROGRESS: { label: 'En curso', cls: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  DONE: { label: 'Completada', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  BLOCKED: { label: 'Bloqueada', cls: 'bg-red-100 text-red-700', dot: 'bg-red-400' }
}

const cfg = computed(() => MAP[props.status])
</script>
