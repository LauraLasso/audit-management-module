<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Dashboard
      </h1>
      <p class="text-gray-500 mt-1">
        Resumen del estado actual de las auditorías
      </p>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Total
        </p>
        <p class="text-3xl font-bold text-gray-900 mt-1">
          {{ stats.total }}
        </p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Completadas
        </p>
        <p class="text-3xl font-bold text-green-600 mt-1">
          {{ stats.done }}
        </p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          En curso
        </p>
        <p class="text-3xl font-bold text-indigo-600 mt-1">
          {{ stats.inProgress }}
        </p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Borrador
        </p>
        <p class="text-3xl font-bold text-gray-400 mt-1">
          {{ stats.draft }}
        </p>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Donut: distribución por estado -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="font-semibold text-gray-900 mb-4">
          Distribución por estado
        </h2>
        <Chart
          type="doughnut"
          :data="donutData"
          :options="donutOptions"
          class="max-h-64"
        />
      </div>

      <!-- Barras: auditorías por proceso -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="font-semibold text-gray-900 mb-4">
          Auditorías por proceso
        </h2>
        <Chart
          type="bar"
          :data="barData"
          :options="barOptions"
          class="max-h-64"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chart from 'primevue/chart'

const { data, fetch, filters } = useAuditList()

onMounted(async () => {
  filters.pageSize = 200
  await fetch()
})

const stats = computed(() => ({
  total: data.value?.total ?? 0,
  done: (data.value?.items ?? []).filter(a => a.status === 'DONE').length,
  inProgress: (data.value?.items ?? []).filter(a => a.status === 'IN_PROGRESS').length,
  draft: (data.value?.items ?? []).filter(a => a.status === 'DRAFT').length,
  blocked: (data.value?.items ?? []).filter(a => a.status === 'BLOCKED').length
}))

// Donut — distribución por estado
const donutData = computed(() => ({
  labels: ['Completada', 'En curso', 'Borrador', 'Bloqueada'],
  datasets: [{
    data: [stats.value.done, stats.value.inProgress, stats.value.draft, stats.value.blocked],
    backgroundColor: ['#22c55e', '#6366f1', '#94a3b8', '#ef4444'],
    borderWidth: 0
  }]
}))

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  }
}

// Barras — agrupación por proceso
const barData = computed(() => {
  const processCounts: Record<string, number> = {}
  data.value.items.forEach((a) => {
    processCounts[a.process] = (processCounts[a.process] ?? 0) + 1
  })
  return {
    labels: Object.keys(processCounts),
    datasets: [{
      label: 'Auditorías',
      data: Object.values(processCounts),
      backgroundColor: '#6366f1',
      borderRadius: 6
    }]
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}
</script>
