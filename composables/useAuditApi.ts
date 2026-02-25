import type {
  Audit, Check, Template,
  PaginatedAudits, AuditDetail, CreateAuditPayload
} from '~/types'

import { useSimulatorConfig } from '~/composables/useSimulatorConfig'

import { useAuditStore } from '~/composables/useAuditStore'

const CACHE_KEY = 'audits_cache'

async function protectedFetch<T> (url: string, options?: any): Promise<T> {
  const { isOnline } = useNetworkStatus()
  if (!isOnline.value) {
    throw new Error('Sin conexión. Los cambios no se guardarán.')
  }
  return await $fetch<T>(url, options)
}

export function useAuditList () {
  const { isOnline } = useNetworkStatus()
  const data = ref<PaginatedAudits>({ items: [], total: 0 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = reactive({
    page: 1,
    pageSize: 10,
    q: '',
    status: [] as string[],
    process: '',
    ownerId: '',
    sort: ''
  })

  async function fetch () {
    loading.value = true
    error.value = null

    // ── OFFLINE: usar caché ──────────────────────────
    if (!isOnline.value) {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        try {
          const cached = JSON.parse(raw)
          if (cached?.items) {
            data.value = cached
            loading.value = false
            return
          }
        } catch {}
      }
      error.value = 'Sin conexión y sin datos en caché.'
      loading.value = false
      return
    }

    // ── ONLINE: fetch normal ─────────────────────────
    try {
      const params: Record<string, any> = {
        page: filters.page, pageSize: filters.pageSize
      }
      if (filters.q) { params.q = filters.q }
      if (filters.status.length) { params.status = filters.status }
      if (filters.process) { params.process = filters.process }
      if (filters.ownerId) { params.ownerId = filters.ownerId }
      if (filters.sort) { params.sort = filters.sort }

      const res = await protectedFetch<PaginatedAudits>('/api/audits', { params })

      data.value = {
        items: Array.isArray(res?.items) ? res.items : [],
        total: res?.total ?? 0
      }

      // ── CACHEAR tras éxito ───────────────────────
      localStorage.setItem(CACHE_KEY, JSON.stringify(data.value))
    } catch (e: any) {
      error.value = e.data?.statusMessage ?? e.message ?? 'Error desconocido'
      data.value = { items: [], total: 0 }
    } finally {
      loading.value = false
    }
  }

  function reset () {
    Object.assign(filters, {
      page: 1,
      q: '',
      status: [],
      process: '',
      ownerId: '',
      sort: ''
    })
  }

  return { data, loading, error, filters, fetch, reset }
}

export function useAuditDetail (id: string) {
  const audit = ref<Audit | null>(null)
  const checks = ref<Check[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch () {
    loading.value = true
    error.value = null
    try {
      const res = await protectedFetch<AuditDetail>(`/api/audits/${id}`)
      audit.value = res.audit
      checks.value = res.checks

      // ✅ REGLA DE COHERENCIA AL CARGAR:
      // Si el servidor dice DONE pero hay KOs, corregimos el estado localmente
      const hasKO = checks.value.some(c => c.status === 'KO')
      if (hasKO && audit.value.status === 'DONE') {
        audit.value.status = 'IN_PROGRESS'
      }
    } catch (e: any) {
      error.value = e.data?.statusMessage ?? e.message ?? 'Error desconocido'
    } finally {
      loading.value = false
    }
  }

  function updateCheckLocally (checkId: string, patch: Partial<Check>) {
    const idx = checks.value.findIndex(c => c.id === checkId)
    if (idx === -1) { return }

    Object.assign(checks.value[idx], patch)
    if (!audit.value) { return }

    // 1. Recalcular progreso (OK y KO cuentan)
    const completed = checks.value.filter(c => c.status === 'OK' || c.status === 'KO').length
    audit.value.progress = Math.round((completed / checks.value.length) * 100)

    // 2. Determinar estado de la auditoría (REGLA DE COHERENCIA)
    const allFinished = checks.value.every(c => c.status === 'OK' || c.status === 'KO')

    if (allFinished) {
      const hasKO = checks.value.some(c => c.status === 'KO')
      // Si hay algún KO, el estado NO puede ser DONE.
      // Lo mantenemos en IN_PROGRESS (como dice el enunciado) o un estado personalizado.
      audit.value.status = hasKO ? 'IN_PROGRESS' : 'DONE'
    } else {
      audit.value.status = 'IN_PROGRESS'
    }
    const { updateAudit } = useAuditStore()
    updateAudit(id, {
      status: audit.value.status,
      progress: audit.value.progress
    })
  }

  async function runAutomaticSimulation () {
    if (!audit.value) { return }

    const { koRate } = useSimulatorConfig()

    // Plan fijo desde el inicio — solo para checks PENDING/QUEUED
    const plan = checks.value
      .filter(c => c.status === 'PENDING' || c.status === 'QUEUED')
      .map(c => ({
        id: c.id,
        result: Math.random() < koRate.value ? 'KO' : 'OK' as 'OK' | 'KO'
      }))

    for (const paso of plan) {
      // Leer estado ACTUAL del check desde el array reactivo
      const current = () => checks.value.find(c => c.id === paso.id)

      // Si el usuario ya lo marcó manualmente, saltarlo
      if (!current() || current()!.status === 'OK' || current()!.status === 'KO') { continue }

      // QUEUED
      updateCheckLocally(paso.id, { status: 'QUEUED', updatedAt: new Date().toISOString() })
      await new Promise(resolve => setTimeout(resolve, 400))

      // Comprobar de nuevo tras la espera
      if (!current() || current()!.status === 'OK' || current()!.status === 'KO') { continue }

      // RUNNING
      updateCheckLocally(paso.id, { status: 'RUNNING', updatedAt: new Date().toISOString() })
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600))

      // Comprobar de nuevo tras la espera
      if (!current() || current()!.status !== 'RUNNING') { continue }

      // Resultado final
      try {
        await protectedFetch(`/api/audits/${id}/checks/${paso.id}`, {
          method: 'PATCH',
          body: {
            status: paso.result,
            reviewed: true,
            evidence: paso.result === 'OK'
              ? 'Verificado automáticamente sin incidencias.'
              : 'Se detectó una anomalía durante la verificación.'
          }
        })
        updateCheckLocally(paso.id, {
          status: paso.result,
          reviewed: true,
          evidence: paso.result === 'OK'
            ? 'Verificado automáticamente sin incidencias.'
            : 'Se detectó una anomalía durante la verificación.',
          updatedAt: new Date().toISOString()
        })
      } catch (e) {
        // console.error('Error persistiendo check:', paso.id, e)
      }
    }
  }

  return {
    audit,
    checks,
    loading,
    error,
    fetch,
    updateCheckLocally,
    runAutomaticSimulation // <-- Exportamos la nueva función
  }
}

export function useCreateAudit () {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function create (payload: CreateAuditPayload): Promise<Audit> {
    loading.value = true
    error.value = null
    try {
      return await protectedFetch<Audit>('/api/audits', { method: 'POST', body: payload })
    } catch (e: any) {
      error.value = e.data?.statusMessage ?? e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, create }
}

export function useRunAudit () {
  const loading = ref(false)

  async function run (id: string) {
    loading.value = true
    try {
      return await protectedFetch(`/api/audits/${id}/run`, { method: 'POST' })
    } finally {
      loading.value = false
    }
  }

  return { loading, run }
}

export function useTemplates () {
  const templates = ref<Template[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch () {
    loading.value = true
    error.value = null
    try {
      templates.value = await protectedFetch<Template[]>('/api/templates')
    } catch (e: any) {
      error.value = e.data?.statusMessage ?? e.message
    } finally {
      loading.value = false
    }
  }

  return { templates, loading, error, fetch }
}
