import { getDb, TEMPLATES, OWNERS } from './_data'
import type { CreateAuditPayload, Check } from '~/types'

export default defineEventHandler(async (event) => {
  await delay()
  mayFail()

  const body = await readBody<CreateAuditPayload>(event)

  const template = TEMPLATES.find(t => t.id === body.templateId)
  const owner = OWNERS.find(o => o.id === body.ownerId)

  if (!template) {
    throw createError({ statusCode: 400, statusMessage: `Template "${body.templateId}" not found` })
  }
  if (!owner) {
    throw createError({ statusCode: 400, statusMessage: `Owner "${body.ownerId}" not found` })
  }
  if (!template.checksPreview || !Array.isArray(template.checksPreview)) {
    throw createError({ statusCode: 500, statusMessage: 'Template has no checksPreview' })
  }

  const { audits, checks } = getDb()
  const now = new Date().toISOString()
  const id = `aud_${Date.now()}`

  checks[id] = template.checksPreview.map((c, i): Check => ({
    id: `chk_${id}_${i + 1}`,
    auditId: id,
    title: c.title,
    priority: c.priority,
    status: 'PENDING',
    evidence: '',
    reviewed: false,
    updatedAt: now
  }))

  const newAudit = {
    id,
    name: body.name,
    process: body.process,
    status: 'DRAFT' as const,
    progress: 0,
    owner,
    targetDate: body.targetDate,
    updatedAt: now,
    createdAt: now,
    templateId: body.templateId
  }

  audits.unshift(newAudit)
  return newAudit
})

function delay () {
  return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 900))
}
function mayFail () {
  if (Math.random() < 0.12) { throw createError({ statusCode: 500, statusMessage: 'Simulated server error' }) }
}
