<template>
  <div class="space-y-6">
    <!-- Aviso offline — encima del listado -->
    <Message
      v-if="!isOnline"
      severity="warn"
      :closable="false"
      class="mb-4"
    >
      <div class="flex items-center gap-2">
        <i class="pi pi-wifi-off" />
        <span>
          Sin conexión. Mostrando el último listado guardado localmente.
          Los cambios no se guardarán hasta restaurar la red.
        </span>
      </div>
    </Message>
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Auditorías
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          Gestiona y supervisa todas tus auditorías
        </p>
      </div>
      <Button label="Nueva auditoría" icon="pi pi-plus" @click="navigateTo('/audits/new')" />
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
          <label class="block text-xs font-medium text-gray-600 mb-1" for="q">Buscar</label>
          <IconField icon-position="left">
            <InputIcon class="pi pi-search" />
            <InputText
              id="q"
              v-model="filters.q"
              placeholder="Nombre, proceso, responsable..."
              class="w-full pl-10 h-10"
              @input="debouncedFetch"
            />
          </IconField>
        </div>

        <div class="min-w-40">
          <label class="block text-xs font-medium text-gray-600 mb-1">Estado</label>
          <MultiSelect
            v-model="filters.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Todos"
            class="w-full h-10"
            @change="onFilterChange"
          />
        </div>

        <div class="min-w-40">
          <label class="block text-xs font-medium text-gray-600 mb-1">Proceso</label>
          <Dropdown
            v-model="filters.process"
            :options="processOptions"
            option-label="label"
            option-value="value"
            placeholder="Todos"
            class="w-full h-10"
            @change="onFilterChange"
          />
        </div>

        <div class="min-w-40">
          <label class="block text-xs font-medium text-gray-600 mb-1">Responsable</label>
          <Dropdown
            v-model="filters.ownerId"
            :options="ownerOptions"
            option-label="label"
            option-value="value"
            placeholder="Todos"
            class="w-full h-10"
            @change="onFilterChange"
          />
        </div>

        <div class="min-w-44">
          <label class="block text-xs font-medium text-gray-600 mb-1">Ordenar por</label>
          <Dropdown
            v-model="filters.sort"
            :options="sortOptions"
            option-label="label"
            option-value="value"
            placeholder="Por defecto"
            class="w-full h-10"
            @change="onFilterChange"
          />
        </div>
      </div>

      <div class="flex justify-start border-t border-gray-50 pt-2">
        <Button
          icon="pi pi-times"
          label="Limpiar filtros"
          text
          severity="secondary"
          size="small"
          class="text-gray-500 hover:text-indigo-600"
          @click="onClear"
        />
      </div>
    </div>

    <!-- Contenido -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Skeleton -->
      <div v-if="loading" class="p-4">
        <SkeletonTable :rows="10" />
      </div>

      <!-- Error -->
      <ErrorState v-else-if="error" :message="error" @retry="loadAudits" />

      <!-- Vacío -->
      <EmptyState
        v-else-if="!data.items.length"
        icon="pi-list-check"
        title="No hay auditorías"
        description="Crea la primera auditoría para empezar."
      >
        <Button label="Crear auditoría" icon="pi pi-plus" @click="navigateTo('/audits/new')" />
      </EmptyState>

      <!-- Tabla -->
      <template v-else>
        <DataTable
          :value="data.items ?? []"
          row-hover
          class="w-full cursor-pointer"
          @row-click="(e) => navigateTo(`/audits/${e.data.id}`)"
        >
          <Column field="name" header="Nombre" sortable>
            <template #body="{ data: row }">
              <div>
                <p class="font-medium text-gray-900 text-sm">
                  {{ row.name }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ row.process }}
                </p>
              </div>
            </template>
          </Column>

          <Column field="status" header="Estado" class="min-w-[140px]">
            <template #body="{ data: row }">
              <div class="flex justify-start">
                <AuditStatusBadge :status="row.status" />
              </div>
            </template>
          </Column>

          <Column field="progress" header="Progreso" style="width:150px">
            <template #body="{ data: row }">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-indigo-500 rounded-full transition-all"
                    :style="{ width: `${row.progress}%` }"
                  />
                </div>
                <span class="text-xs text-gray-500 w-8 text-right">{{ row.progress }}%</span>
              </div>
            </template>
          </Column>

          <Column field="owner.name" header="Responsable" style="width:170px">
            <template #body="{ data: row }">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {{ row.owner.name[0] }}
                </div>
                <span class="text-sm">{{ row.owner.name }}</span>
              </div>
            </template>
          </Column>

          <Column field="targetDate" header="Fecha límite" style="width:130px">
            <template #body="{ data: row }">
              <span :class="['text-sm', isOverdue(row) ? 'text-red-500 font-medium' : 'text-gray-500']">
                {{ formatDate(row.targetDate) }}
              </span>
            </template>
          </Column>

          <Column style="width:50px">
            <template #body="{ data: row }">
              <Button
                icon="pi pi-chevron-right"
                text
                rounded
                size="small"
                @click.stop="navigateTo(`/audits/${row.id}`)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- Paginación -->
        <div class="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span class="text-sm text-gray-500">
            {{ rangeStart }}–{{ rangeEnd }} de {{ data.total }} auditorías
          </span>
          <Paginator
            :first="paginatorFirst"
            :rows="filters.pageSize"
            :total-records="data.total"
            :rows-per-page-options="[5, 10, 20, 50]"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            @page="onPage"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { OWNERS, PROCESSES } from '~/utils/data'

const route = useRoute()
const router = useRouter()
const { isOnline } = useNetworkStatus()

const { data, loading, error, filters, fetch } = useAuditList()

// Inicializar filtros desde URL
filters.page = Number(route.query.page) || 1
filters.pageSize = Number(route.query.pageSize) || 10
filters.q = (route.query.q as string) || ''
filters.process = (route.query.process as string) || ''
filters.ownerId = (route.query.ownerId as string) || ''
filters.sort = (route.query.sort as string) || ''
filters.status = route.query.status
  ? (Array.isArray(route.query.status) ? route.query.status : [route.query.status]) as string[]
  : []

// Opciones de filtros
const statusOptions = [
  { label: 'Borrador', value: 'DRAFT' },
  { label: 'En curso', value: 'IN_PROGRESS' },
  { label: 'Completada', value: 'DONE' },
  { label: 'Bloqueada', value: 'BLOCKED' }
]
const processOptions = [
  { label: 'Todos', value: '' },
  ...PROCESSES.map(p => ({ label: p, value: p }))
]
const ownerOptions = [
  { label: 'Todos', value: '' },
  ...OWNERS.map(o => ({ label: o.name, value: o.id }))
]
const sortOptions = [
  { label: 'Nombre A-Z', value: 'name_asc' },
  { label: 'Nombre Z-A', value: 'name_desc' },
  { label: 'Más recientes', value: 'updatedAt_desc' },
  { label: 'Más antiguos', value: 'updatedAt_asc' },
  { label: 'Progreso ↑', value: 'progress_asc' },
  { label: 'Progreso ↓', value: 'progress_desc' }
]

// Paginación
const paginatorFirst = computed(() => (filters.page - 1) * filters.pageSize)
const rangeStart = computed(() => (filters.page - 1) * filters.pageSize + 1)
const rangeEnd = computed(() => Math.min(filters.page * filters.pageSize, data.value.total))

function onPage (e: any) {
  filters.page = e.page + 1
  filters.pageSize = e.rows
  loadAudits()
}

function onFilterChange () {
  filters.page = 1
  loadAudits()
}

function onClear () {
  filters.q = ''
  filters.status = []
  filters.process = ''
  filters.ownerId = ''
  filters.sort = ''
  filters.page = 1
  loadAudits()
}

// Sync URL + fetch
async function loadAudits () {
  syncUrl()
  await fetch()
}

function syncUrl () {
  router.replace({
    query: {
      ...(filters.q && { q: filters.q }),
      ...(filters.status.length && { status: filters.status }),
      ...(filters.process && { process: filters.process }),
      ...(filters.ownerId && { ownerId: filters.ownerId }),
      ...(filters.sort && { sort: filters.sort }),
      page: String(filters.page),
      pageSize: String(filters.pageSize)
    }
  })
}

// Debounce para búsqueda de texto
let timer: ReturnType<typeof setTimeout>
function debouncedFetch () {
  clearTimeout(timer)
  timer = setTimeout(() => {
    filters.page = 1
    loadAudits()
  }, 400)
}

// Utils
function formatDate (d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function isOverdue (row: any) {
  return row.status !== 'DONE' && new Date(row.targetDate) < new Date()
}

onMounted(loadAudits)
</script>
