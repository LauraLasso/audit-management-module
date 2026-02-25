import { getDb } from '../../../_data'

export default defineEventHandler(async (event) => {
  const auditId = getRouterParam(event, 'id')!
  const checkId = getRouterParam(event, 'checkId')!
  const body = await readBody(event)

  const { audits, checks } = getDb()
  const auditChecks = checks[auditId]
  if (!auditChecks) { throw createError({ statusCode: 404, statusMessage: 'Audit not found' }) }

  const check = auditChecks.find(c => c.id === checkId)
  if (!check) { throw createError({ statusCode: 404, statusMessage: 'Check not found' }) }

  // 1. Aplicar patch al check
  if (body.status) { check.status = body.status }
  if (body.reviewed !== undefined) { check.reviewed = body.reviewed }
  if (body.evidence) { check.evidence = body.evidence }
  check.updatedAt = new Date().toISOString()

  // 2. Recalcular la auditoría (REGLA DE COHERENCIA RAÍZ)
  const audit = audits.find(a => a.id === auditId)
  if (audit) {
    const completedChecks = auditChecks.filter(c => c.status === 'OK' || c.status === 'KO')
    const hasKO = auditChecks.some(c => c.status === 'KO')
    const allFinished = completedChecks.length === auditChecks.length

    // Actualizar progreso
    audit.progress = Math.round((completedChecks.length / auditChecks.length) * 100)
    audit.updatedAt = new Date().toISOString()

    // Lógica de estado según enunciado (Punto 6)
    if (allFinished) {
      // Si hay al menos un KO, NUNCA puede estar DONE
      audit.status = hasKO ? 'IN_PROGRESS' : 'DONE'
    } else {
      // Si faltan checks por procesar, sigue en curso
      audit.status = 'IN_PROGRESS'
    }
  }
  auditChecks.sort((a, b) => a.id.localeCompare(b.id))
  return check
})
