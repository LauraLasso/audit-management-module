<template>
  <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
    <button
      class="text-gray-500 hover:text-gray-900 transition-colors"
      aria-label="Toggle sidebar"
      @click="$emit('toggle')"
    >
      <i class="pi pi-bars text-lg" />
    </button>

    <span class="text-sm text-gray-400">{{ fechaActual }}</span>

    <div class="flex items-center gap-2">
      <!-- Notificaciones -->
      <div ref="bellRef" class="relative">
        <button
          class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative"
          aria-label="Notificaciones"
          @click="showBell = !showBell"
        >
          <i class="pi pi-bell text-lg" />
          <span
            v-if="notifications.length > 0"
            class="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
          >
            {{ notifications.length > 9 ? '9+' : notifications.length }}
          </span>
        </button>

        <!-- Panel notificaciones -->
        <Transition name="fade-down">
          <div
            v-if="showBell"
            class="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span class="font-semibold text-sm text-gray-900">Notificaciones</span>
              <span class="text-xs text-gray-400">{{ notifications.length }} alerta{{ notifications.length !== 1 ? 's' : '' }}</span>
            </div>

            <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-sm text-gray-400">
              <i class="pi pi-check-circle text-2xl block mb-2 text-green-400" />
              Todo al día, sin alertas pendientes
            </div>

            <ul v-else class="max-h-72 overflow-y-auto divide-y divide-gray-50">
              <li
                v-for="n in notifications"
                :key="n.id"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                @click="goToAudit(n.auditId)"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="mt-0.5 w-2 h-2 rounded-full shrink-0"
                    :class="n.type === 'overdue' ? 'bg-red-500' : 'bg-amber-400'"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ n.auditName }}
                    </p>
                    <p
                      class="text-xs mt-0.5"
                      :class="n.type === 'overdue' ? 'text-red-500' : 'text-amber-500'"
                    >
                      {{ n.message }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </Transition>
      </div>

      <!-- junto al botón de configuración -->
      <button
        v-tooltip.bottom="isOnline ? 'Simular sin red' : 'Restaurar red'"
        class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
        :class="isOnline ? 'text-gray-500 hover:bg-gray-100' : 'text-red-500 bg-red-50 hover:bg-red-100'"
        aria-label="Toggle red"
        @click="isOnline = !isOnline"
      >
        <i class="pi text-lg" :class="isOnline ? 'pi-wifi' : 'pi-times-circle'" />
      </button>

      <!-- Configuración -->
      <button
        v-tooltip.left="'Configuración'"
        class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Configuración"
        @click="showConfig = true"
      >
        <i class="pi pi-cog text-lg" />
      </button>
    </div>
  </header>

  <!-- Dialog configuración -->
  <Dialog
    v-model:visible="showConfig"
    header="Configuración del simulador"
    :modal="true"
    :style="{ width: '24rem' }"
  >
    <div class="space-y-4 py-2">
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">
          Probabilidad de error en API ({{ Math.round(draftErrorRate * 100) }}%)
        </label>
        <Slider v-model="draftErrorRate" :min="0" :max="0.5" :step="0.01" class="w-full" />
        <p class="text-xs text-gray-400 mt-1">
          Simula fallos de red entre 0% y 50%
        </p>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">
          Probabilidad de KO en ejecución ({{ Math.round(draftKoRate * 100) }}%)
        </label>
        <Slider v-model="draftKoRate" :min="0" :max="1" :step="0.05" class="w-full" />
        <p class="text-xs text-gray-400 mt-1">
          Porcentaje de checks que fallarán al ejecutar automáticamente
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <Button label="Cerrar" severity="secondary" outlined @click.stop="closeConfig" />
        <Button label="Aplicar" icon="pi pi-check" @click.stop="applyConfig" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
defineEmits<{ toggle: [] }>()

// ── Datos ────────────────────────────────────────────────
const { isOnline } = useNetworkStatus()
const { audits } = useAuditStore()
const { errorRate, koRate } = useSimulatorConfig()
const { notifications } = useNotifications(audits)

// ── Estado UI ────────────────────────────────────────────
const showBell = ref(false)
const showConfig = ref(false)
const bellRef = ref<HTMLElement | null>(null)

// ── Un único onMounted ───────────────────────────────────
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// ── Click fuera del panel ────────────────────────────────
function handleClickOutside (event: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(event.target as Node)) {
    showBell.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────
function goToAudit (id: string) {
  showBell.value = false
  navigateTo(`/audits/${id}`)
}

const fechaActual = new Date().toLocaleDateString('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})

// Valores draft — el slider mueve estos, no los reales
const draftErrorRate = ref(errorRate.value)
const draftKoRate = ref(koRate.value)
const configApplied = ref(false)

// Sincronizar draft al abrir el dialog
watch(showConfig, (val) => {
  if (val) {
    draftErrorRate.value = errorRate.value
    draftKoRate.value = koRate.value
    configApplied.value = false
  }
})

const toast = useToast()

function applyConfig () {
  errorRate.value = draftErrorRate.value
  koRate.value = draftKoRate.value
  showConfig.value = false // ← cierra el dialog

  // Toast de confirmación
  toast.add({
    severity: 'success',
    summary: 'Configuración aplicada',
    detail: `Error API: ${Math.round(errorRate.value * 100)}% · KO ejecución: ${Math.round(koRate.value * 100)}%`,
    life: 3000
  })
}

function closeConfig () {
  showConfig.value = false // ← cierra sin aplicar
}
</script>

<style scoped>
.fade-down-enter-active,
.fade-down-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
