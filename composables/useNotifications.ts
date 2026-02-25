import type { Ref } from 'vue'
import type { Audit } from '~/types'

export interface AuditNotification {
  id: string
  auditId: string
  auditName: string
  type: 'overdue' | 'due-soon'
  daysLeft: number
  message: string
}

function calcNotifications (audits: Audit[]): AuditNotification[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return audits
    .filter(a => (a.status === 'DRAFT' || a.status === 'IN_PROGRESS') && a.targetDate)
    .flatMap((a): AuditNotification[] => {
      const target = new Date(a.targetDate!)
      target.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86_400_000)

      if (daysLeft < 0) {
        return [{
          id: `overdue-${a.id}`,
          auditId: a.id,
          auditName: a.name,
          type: 'overdue',
          daysLeft,
          message: `Vencida hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) !== 1 ? 's' : ''}`
        }]
      }
      if (daysLeft <= 7) {
        return [{
          id: `due-soon-${a.id}`,
          auditId: a.id,
          auditName: a.name,
          type: 'due-soon',
          daysLeft,
          message: daysLeft === 0 ? 'Vence hoy' : `Vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`
        }]
      }
      return []
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

export function useNotifications (auditsRef: Ref<Audit[]>) {
  const notifications = ref<AuditNotification[]>([])

  // watch con deep:true para detectar cambios internos del array
  watch(
    auditsRef,
    (newAudits) => {
      notifications.value = calcNotifications(newAudits ?? [])
    },
    { immediate: true, deep: true }
  )

  return { notifications }
}
