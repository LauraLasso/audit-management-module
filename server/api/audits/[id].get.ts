// server/api/audits/[id].get.ts (Crea este archivo si no lo tienes así)
import { getDb } from '../_data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const { audits, checks } = getDb()

  const audit = audits.find(a => a.id === id)
  const auditChecks = checks[id!]

  if (!audit || !auditChecks) {
    throw createError({ statusCode: 404, statusMessage: 'Audit not found' })
  }

  // SIEMPRE ORDENADOS POR ID ANTES DE ENVIAR AL FRONTEND
  return {
    audit,
    checks: [...auditChecks].sort((a, b) => a.id.localeCompare(b.id))
  }
})
