<template>
  <NuxtLink
    :to="`/audits/${audit.id}`"
    class="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-4">
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
          {{ audit.name }}
        </p>
        <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          <i class="pi pi-tag text-[10px]" />
          {{ audit.process }}
        </p>
      </div>
      <AuditStatusBadge :status="audit.status" />
    </div>

    <!-- Progreso -->
    <div class="mb-4">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs text-gray-500">Progreso</span>
        <span class="text-xs font-semibold text-indigo-600">{{ audit.progress }}%</span>
      </div>
      <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="progressBarColor"
          :style="{ width: `${audit.progress}%` }"
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between text-xs text-gray-500">
      <!-- Responsable -->
      <div class="flex items-center gap-1.5">
        <div class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
          {{ initials(audit.owner.name) }}
        </div>
        <span>{{ audit.owner.name }}</span>
      </div>

      <!-- Fecha límite -->
      <div
        class="flex items-center gap-1"
        :class="isOverdue ? 'text-red-500' : 'text-gray-400'"
      >
        <i class="pi pi-calendar text-[10px]" />
        <span>{{ formatDate(audit.targetDate) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Audit } from '~/types'
import AuditStatusBadge from '~/components/AuditStatusBadge.vue'

const props = defineProps<{ audit: Audit }>()

const isOverdue = computed(() =>
  props.audit.status !== 'DONE' && new Date(props.audit.targetDate) < new Date()
)

const progressBarColor = computed(() => {
  if (props.audit.status === 'DONE') { return 'bg-green-500' }
  if (props.audit.status === 'BLOCKED') { return 'bg-red-400' }
  if (props.audit.progress >= 75) { return 'bg-indigo-500' }
  if (props.audit.progress >= 40) { return 'bg-yellow-400' }
  return 'bg-gray-300'
})

function initials (name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

function formatDate (d: string): string {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>
