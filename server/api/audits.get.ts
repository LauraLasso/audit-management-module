import { getDb } from './_data'

export default defineEventHandler(async (event) => {
  await delay()
  mayFail()

  const q = getQuery(event)
  const page = Number(q.page) || 1
  const pageSize = Number(q.pageSize) || 10
  const search = (q.q as string) || ''
  const status = q.status ? (Array.isArray(q.status) ? q.status : [q.status]) as string[] : []
  const process = (q.process as string) || ''
  const ownerId = (q.ownerId as string) || ''
  const sort = (q.sort as string) || ''

  let items = [...getDb().audits]

  if (search) {
    const l = search.toLowerCase()
    items = items.filter(a =>
      a.name.toLowerCase().includes(l) ||
      a.process.toLowerCase().includes(l) ||
      a.owner.name.toLowerCase().includes(l)
    )
  }
  if (status.length) { items = items.filter(a => status.includes(a.status)) }
  if (process) { items = items.filter(a => a.process === process) }
  if (ownerId) { items = items.filter(a => a.owner.id === ownerId) }

  if (sort) {
    const parts = sort.split('_')
    const field = parts[0] ?? ''
    const dir = parts[1] ?? 'asc'
    items.sort((a, b) => {
      const va = String(a[field as keyof typeof a] ?? '')
      const vb = String(b[field as keyof typeof b] ?? '')
      const cmp = va.localeCompare(vb)
      return dir === 'desc' ? -cmp : cmp
    })
  }

  const total = items.length
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total }
})

function delay () {
  return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 900))
}
function mayFail () {
  if (Math.random() < 0.12) { throw createError({ statusCode: 500, statusMessage: 'Simulated server error' }) }
}
