<template>
  <div :class="['rounded-lg border transition-all duration-300 bg-white', borderCls]">
    <div class="flex items-start gap-4 p-4">
      <div class="shrink-0 mt-0.5 w-5 text-center">
        <i v-if="check.status === 'RUNNING'" class="pi pi-spin pi-spinner text-blue-500 text-lg" />
        <i v-else-if="check.status === 'OK'" class="pi pi-check-circle text-green-500 text-lg" />
        <i v-else-if="check.status === 'KO'" class="pi pi-times-circle text-red-500 text-lg" />
        <i v-else-if="check.status === 'QUEUED'" class="pi pi-clock text-gray-400 text-lg" />
        <i v-else class="pi pi-circle text-gray-300 text-lg" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm font-medium text-gray-900">{{ check.title }}</span>
          <CheckPriorityBadge :priority="check.priority" />

          <span v-if="check.status === 'RUNNING'" class="text-xs font-semibold text-blue-500 animate-pulse flex items-center gap-1">
            Validando...
          </span>
          <span v-else-if="check.status === 'QUEUED'" class="text-xs font-medium text-gray-400 flex items-center gap-1">
            En cola...
          </span>
        </div>

        <p v-if="check.evidence && check.status !== 'KO'" class="text-xs text-gray-500 mt-1">
          {{ check.evidence }}
        </p>
      </div>

      <div v-if="canManual" class="flex gap-2 shrink-0">
        <Button
          label="OK"
          icon="pi pi-check"
          size="small"
          severity="success"
          outlined
          :loading="loading"
          :disabled="loading || check.status === 'OK'"
          @click="$emit('manual', check.id, 'OK')"
        />
        <Button
          label="KO"
          icon="pi pi-times"
          size="small"
          severity="danger"
          outlined
          :loading="loading"
          :disabled="loading || check.status === 'KO'"
          @click="$emit('manual', check.id, 'KO')"
        />
      </div>
    </div>

    <div v-if="check.status === 'KO'" class="px-4 pb-4 pt-0 border-t border-red-100">
      <p class="text-xs font-medium text-red-600 mb-1.5 flex items-center gap-1 mt-3">
        <i class="pi pi-exclamation-circle" />
        Evidencia del fallo
      </p>
      <div class="flex gap-2 items-start">
        <Textarea
          v-model="evidenceInput"
          rows="2"
          :placeholder="'Describe el motivo del fallo o añade evidencia...'"
          class="text-sm flex-1 resize-none"
          :disabled="loading || saved"
        />
        <div class="flex flex-col gap-1.5">
          <Button
            label="Guardar"
            icon="pi pi-save"
            size="small"
            severity="danger"
            :outlined="!saved"
            :disabled="!evidenceInput.trim() || loading || saved"
            :loading="loading"
            @click="onSave"
          />
          <Button
            v-if="saved"
            label="Editar"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            outlined
            @click="saved = false"
          />
        </div>
      </div>
      <p v-if="saved && check.evidence" class="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
        <i class="pi pi-check text-green-500" />
        Guardado: {{ check.evidence }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Check } from '~/types'

const props = defineProps<{
  check: Check
  canManual?: boolean
  loading?: boolean
}>()
const emit = defineEmits<{
  manual: [id: string, result: 'OK' | 'KO']
  'save-evidence': [id: string, evidence: string]
}>()

// Inicializa con la evidencia existente si ya tiene
const evidenceInput = ref(props.check.evidence ?? '')
const saved = ref(!!props.check.evidence)

// Sincronizar evidencia si cambia externamente
watch(() => props.check.evidence, (val) => {
  evidenceInput.value = val ?? ''
  saved.value = !!val
})

function onSave () {
  if (!evidenceInput.value.trim()) { return }
  emit('save-evidence', props.check.id, evidenceInput.value.trim())
  saved.value = true
}

const borderCls = computed(() => ({
  'border-green-200 bg-green-50/10': props.check.status === 'OK',
  'border-red-200 bg-red-50/30': props.check.status === 'KO',
  'border-blue-200 bg-blue-50/20': props.check.status === 'RUNNING',
  'border-gray-100': props.check.status === 'QUEUED',
  'border-gray-200': !['OK', 'KO', 'RUNNING', 'QUEUED'].includes(props.check.status)
}))
</script>
