import { getDb } from '../../_data'
import type { Audit, Check } from '~/types'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!
  const { audits, checks } = getDb()
  const audit = audits.find(a => a.id === id)

  if (!audit) { throw createError({ statusCode: 404, statusMessage: 'Audit not found' }) }

  const chks = checks[id] ?? []
  audit.status = 'IN_PROGRESS'
  audit.updatedAt = new Date().toISOString()
  chks.forEach((c) => { if (c.status === 'PENDING') { c.status = 'QUEUED' } })

  // Ejecución progresiva en background
  runInBackground(audit, chks)

  return { runId: `run_${Date.now()}` }
})

async function runInBackground (audit: Audit, checks: Check[]) {
  const KO_RATE = 0.15
  for (const check of checks) {
    if (check.status !== 'QUEUED') { continue }
    check.status = 'RUNNING'
    check.updatedAt = new Date().toISOString()

    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 1000))

    check.status = Math.random() < KO_RATE ? 'KO' : 'OK'
    check.reviewed = true
    check.evidence = check.status === 'OK'
      ? 'Verificado automáticamente sin incidencias.'
      : 'Se detectó una anomalía durante la verificación.'
    check.updatedAt = new Date().toISOString()

    const done = checks.filter(c => c.status === 'OK' || c.status === 'KO').length
    audit.progress = Math.round((done / checks.length) * 100)
    audit.updatedAt = new Date().toISOString()
  }

  audit.status = checks.every(c => c.status === 'OK') ? 'DONE' : 'IN_PROGRESS'
  audit.progress = 100
}
