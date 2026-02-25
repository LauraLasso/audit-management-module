<template>
  <!-- Loading -->
  <div v-if="loading" class="space-y-6">
    <Skeleton height="2.5rem" width="20rem" border-radius="0.5rem" />
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton v-for="i in 4" :key="i" height="6rem" border-radius="0.75rem" />
    </div>
    <SkeletonTable :rows="12" />
  </div>

  <!-- Error -->
  <ErrorState v-else-if="error" :message="error" @retry="load" />

  <!-- Detalle -->
  <div v-else-if="audit" class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <NuxtLink
          to="/audits"
          class="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1"
        >
          <i class="pi pi-arrow-left text-xs" /> Volver
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900 mt-2">
          {{ audit.name }}
        </h1>
        <div class="flex items-center gap-2 mt-1 flex-wrap">
          <AuditStatusBadge :status="audit.status" />
          <Tag :value="audit.process" severity="secondary" />
        </div>
      </div>

      <Button
        v-if="canRun || running"
        ref="runBtn"
        :label="running ? 'Ejecutando...' : 'Ejecutar auditoría'"
        :icon="running ? 'pi pi-spin pi-spinner' : 'pi pi-play'"
        severity="success"
        :disabled="running"
        @click="onRun"
      />
    </div>

    <!-- Banner de incidencias (persiste hasta que el usuario lo cierra) -->
    <Message v-if="showIncidentBanner" severity="warn" :closable="true" @close="showIncidentBanner = false">
      Ejecución completada con <strong>{{ koCount }} incidencia{{ koCount !== 1 ? 's' : '' }}</strong>.
      Revisa los checks en KO y añade evidencia antes de cerrar la auditoría.
    </Message>

    <!-- Banner DONE -->
    <Message v-if="audit.status === 'DONE'" severity="success" :closable="false">
      <div class="flex items-center gap-2">
        <i class="pi pi-check-circle" />
        <span>Auditoría completada correctamente.</span>
      </div>
    </Message>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Progreso
        </p>
        <p class="text-3xl font-bold text-gray-900 mt-1">
          {{ audit.progress }}%
        </p>
        <div class="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="progressBarColor"
            :style="{ width: `${audit.progress}%` }"
          />
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Responsable
        </p>
        <div class="flex items-center gap-2 mt-2">
          <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
            {{ audit.owner.name[0] }}
          </div>
          <span class="text-sm font-medium">{{ audit.owner.name }}</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Fecha límite
        </p>
        <p class="text-sm font-semibold text-gray-900 mt-2">
          {{ formatDate(audit.targetDate) }}
        </p>
        <p class="text-xs text-gray-400 mt-0.5">
          Creada {{ formatDate(audit.createdAt) }}
        </p>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Checks
        </p>
        <p class="text-3xl font-bold text-gray-900 mt-1">
          {{ checks.length }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          <span class="text-green-600 font-medium">{{ okCount }} OK</span> ·
          <span class="text-red-500 font-medium">{{ koCount }} KO</span> ·
          {{ pendingCount }} pendientes
        </p>
      </div>
    </div>

    <!-- Checks -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <h2 class="font-semibold text-gray-900">
          Checks
          <span class="text-gray-400 font-normal text-sm ml-1">({{ checks.length }})</span>
        </h2>
        <div class="flex gap-2">
          <Tag v-if="okCount" :value="`${okCount} OK`" severity="success" />
          <Tag v-if="koCount" :value="`${koCount} KO`" severity="danger" />
          <Tag v-if="runningCount" :value="`${runningCount} en curso`" severity="info" />
        </div>
      </div>

      <EmptyState
        v-if="!checks.length"
        icon="pi-list-check"
        title="No hay checks"
        description="Esta auditoría no tiene checks asociados."
      />

      <div v-else class="p-4 space-y-2">
        <CheckRow
          v-for="check in checks"
          :key="check.id"
          :check="check"
          :can-manual="canManualCheck(check)"
          :loading="patchingId === check.id"
          @manual="onManual"
          @save-evidence="onSaveEvidence"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import type { Check } from '~/types'

const route = useRoute()
const toast = useToast()
const id = route.params.id as string

const { audit, checks, loading, error, fetch: fetchDetail, updateCheckLocally, runAutomaticSimulation } = useAuditDetail(id)
const { run } = useRunAudit()

const okCount = computed(() =>
  (checks.value ?? []).filter(c => c.status === 'OK').length
)
const koCount = computed(() =>
  (checks.value ?? []).filter(c => c.status === 'KO').length
)
const pendingCount = computed(() =>
  (checks.value ?? []).filter(c => c.status === 'PENDING' || c.status === 'QUEUED').length
)
const runningCount = computed(() =>
  (checks.value ?? []).filter(c => c.status === 'RUNNING').length
)

// Barra de progreso: verde si DONE, amarilla si hay KOs, índigo si normal
const progressBarColor = computed(() => {
  if (audit.value?.status === 'DONE') { return 'bg-green-500' }
  if (koCount.value > 0) { return 'bg-amber-500' }
  return 'bg-indigo-500'
})

// El botón ejecutar solo aparece si no está DONE y no está ya ejecutando
const canRun = computed(() => {
  const isNotFinished = audit.value?.status !== 'DONE' && audit.value?.status !== 'BLOCKED';
  const hasPendingChecks = pendingCount.value > 0;
  
  return isNotFinished && hasPendingChecks;
});

const running = ref(false)
const patchingId = ref<string | null>(null)
const showIncidentBanner = ref(false)
const executionFinished = ref(false) // evita re-ejecutar tras terminar con KOs

function canManualCheck (check: Check) {
  return (
    audit.value?.status === 'IN_PROGRESS' &&
    (check.status === 'PENDING' || check.status === 'QUEUED')
  )
}

async function onRun () {
  if (!audit.value) { return }
  running.value = true
  showIncidentBanner.value = false
  executionFinished.value = false

  try {
    await run(id) // Aviso inicial de ejecución

    // Ejecuta y guarda paso a paso
    await runAutomaticSimulation()

    // ✅ YA NO HACEMOS fetchDetail() AQUÍ.
    // Los datos locales ya son los buenos y ya están en el servidor.

    executionFinished.value = true

    const hasKO = checks.value.some(c => c.status === 'KO')
    if (hasKO) {
      showIncidentBanner.value = true
      toast.add({ severity: 'warn', summary: 'Incidencias', detail: 'Revise los fallos.', life: 5000 })
    } else {
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Todo OK.', life: 5000 })
    }
  } catch (e: any) {
    // ... handling error
  } finally {
    running.value = false
  }
}

// Respuesta manual OK/KO — UI optimista + rollback
async function onManual (checkId: string, result: 'OK' | 'KO') {
  const check = checks.value.find(c => c.id === checkId)
  if (!check) { return }

  const snapshot: Check = { ...check }

  // Actualizamos localmente PRIMERO para "ganar la carrera" a la simulación
  updateCheckLocally(checkId, {
    status: result,
    reviewed: true,
    evidence: result === 'OK' ? 'Revisado manualmente' : 'Marcado como KO manualmente'
  })

  patchingId.value = checkId

  try {
    await $fetch(`/api/audits/${id}/checks/${checkId}`, {
      method: 'PATCH',
      body: { status: result, reviewed: true }
    })
    // No hace falta fetchDetail aquí porque queremos mantener nuestro estado local
  } catch (e: any) {
    updateCheckLocally(checkId, snapshot)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
  } finally {
    patchingId.value = null
  }
}

// Guardar evidencia en un check KO — UI optimista + rollback
async function onSaveEvidence (checkId: string, evidence: string) {
  const check = checks.value.find(c => c.id === checkId)
  if (!check) { return }

  const snapshot: Check = { ...check }

  updateCheckLocally(checkId, { evidence, updatedAt: new Date().toISOString() })
  patchingId.value = checkId

  try {
    await $fetch(`/api/audits/${id}/checks/${checkId}`, {
      method: 'PATCH',
      body: { evidence }
    })
    toast.add({
      severity: 'success',
      summary: 'Evidencia guardada',
      detail: 'La evidencia se ha registrado correctamente.',
      life: 3000
    })
  } catch (e: any) {
    updateCheckLocally(checkId, snapshot)
    toast.add({
      severity: 'error',
      summary: 'Error al guardar evidencia',
      detail: e.message,
      life: 4000
    })
  } finally {
    patchingId.value = null
  }
}

function formatDate (d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

async function load () {
  await fetchDetail()
}

onMounted(load)

const runBtn = ref()

// Al cargar la página, mover foco al botón ejecutar si está disponible
watch(() => audit.value, (val) => {
  if (val && canRun.value) {
    nextTick(() => runBtn.value?.$el?.focus())
  }
}, { once: true })
</script>
