import type { Audit, Check, Template, AuditStatus, CheckStatus } from '~/types'

// Al principio de server/api/_data.ts — reemplaza las definiciones locales
import { OWNERS, PROCESSES } from '~/utils/data'

export { OWNERS, PROCESSES } // re-exporta para que otros server files sigan funcionando

export const TEMPLATES: Template[] = [
  {
    id: 'tpl_01',
    name: 'ISO 27001 Base',
    process: 'Seguridad',
    checkCount: 12,
    checksPreview: [
      { title: 'Gestión de accesos', priority: 'HIGH' },
      { title: 'Backup y recuperación', priority: 'MEDIUM' },
      { title: 'Control de parches', priority: 'HIGH' },
      { title: 'Política de contraseñas', priority: 'MEDIUM' },
      { title: 'Cifrado de datos en reposo', priority: 'HIGH' },
      { title: 'Auditoría de logs', priority: 'MEDIUM' },
      { title: 'Gestión de vulnerabilidades', priority: 'HIGH' },
      { title: 'Segmentación de red', priority: 'MEDIUM' },
      { title: 'Plan de continuidad', priority: 'LOW' },
      { title: 'Formación en seguridad', priority: 'LOW' },
      { title: 'Control de acceso físico', priority: 'HIGH' },
      { title: 'Gestión de incidentes', priority: 'HIGH' }
    ]
  },
  {
    id: 'tpl_02',
    name: 'SOX Compras',
    process: 'Compras',
    checkCount: 10,
    checksPreview: [
      { title: 'Aprobación de órdenes de compra', priority: 'HIGH' },
      { title: 'Segregación de funciones', priority: 'MEDIUM' },
      { title: 'Homologación de proveedores', priority: 'HIGH' },
      { title: 'Conciliación de facturas', priority: 'MEDIUM' },
      { title: 'Control de inventario', priority: 'LOW' },
      { title: 'Evaluación de proveedores', priority: 'MEDIUM' },
      { title: 'Registro de reclamaciones', priority: 'LOW' },
      { title: 'Plazos de pago', priority: 'LOW' },
      { title: 'Contratos vigentes', priority: 'HIGH' },
      { title: 'Licitaciones documentadas', priority: 'MEDIUM' }
    ]
  },
  {
    id: 'tpl_03',
    name: 'GDPR Básico',
    process: 'Legal',
    checkCount: 10,
    checksPreview: [
      { title: 'Consentimiento explícito', priority: 'HIGH' },
      { title: 'Registro de tratamientos', priority: 'MEDIUM' },
      { title: 'Cumplimiento RGPD documentado', priority: 'HIGH' },
      { title: 'Políticas internas publicadas', priority: 'MEDIUM' },
      { title: 'Poderes notariales actualizados', priority: 'MEDIUM' },
      { title: 'Seguros corporativos vigentes', priority: 'HIGH' },
      { title: 'Litigios activos documentados', priority: 'MEDIUM' },
      { title: 'Contratos con terceros vigentes', priority: 'HIGH' },
      { title: 'Actas del consejo actualizadas', priority: 'MEDIUM' },
      { title: 'Cumplimiento normativa sectorial', priority: 'HIGH' }
    ]
  },
  {
    id: 'tpl_04',
    name: 'Ventas Q1',
    process: 'Ventas',
    checkCount: 11,
    checksPreview: [
      { title: 'Pipeline actualizado en CRM', priority: 'HIGH' },
      { title: 'Descuentos con autorización', priority: 'MEDIUM' },
      { title: 'Contratos de clientes firmados', priority: 'HIGH' },
      { title: 'KPIs de ventas reportados', priority: 'MEDIUM' },
      { title: 'Comisiones calculadas', priority: 'MEDIUM' },
      { title: 'Devoluciones gestionadas', priority: 'LOW' },
      { title: 'Precio de venta vs tarifa', priority: 'HIGH' },
      { title: 'Margen por cliente', priority: 'MEDIUM' },
      { title: 'Cartera de clientes revisada', priority: 'LOW' },
      { title: 'Satisfaction score clientes', priority: 'MEDIUM' },
      { title: 'Oportunidades perdidas', priority: 'LOW' }
    ]
  },
  {
    id: 'tpl_05',
    name: 'RRHH Onboarding',
    process: 'RRHH',
    checkCount: 10,
    checksPreview: [
      { title: 'Contratos firmados al día', priority: 'HIGH' },
      { title: 'Evaluaciones de desempeño', priority: 'MEDIUM' },
      { title: 'Cumplimiento LOPD expedientes', priority: 'HIGH' },
      { title: 'Gestión de bajas y altas', priority: 'HIGH' },
      { title: 'Prevención de riesgos laborales', priority: 'HIGH' },
      { title: 'Control de horas extras', priority: 'MEDIUM' },
      { title: 'Permisos y licencias', priority: 'LOW' },
      { title: 'Planes de acogida', priority: 'LOW' },
      { title: 'Formaciones registradas', priority: 'LOW' },
      { title: 'Protocolo acoso laboral', priority: 'HIGH' }
    ]
  },
  {
    id: 'tpl_06',
    name: 'Operaciones Mensual',
    process: 'Operaciones',
    checkCount: 12,
    checksPreview: [
      { title: 'Procesos documentados', priority: 'HIGH' },
      { title: 'KPIs operativos reportados', priority: 'MEDIUM' },
      { title: 'Control de calidad', priority: 'HIGH' },
      { title: 'Gestión de incidencias operativas', priority: 'HIGH' },
      { title: 'Mantenimiento preventivo', priority: 'MEDIUM' },
      { title: 'Control de stock', priority: 'MEDIUM' },
      { title: 'Trazabilidad de producto', priority: 'MEDIUM' },
      { title: 'Plazos de entrega cumplidos', priority: 'HIGH' },
      { title: 'Eficiencia de procesos', priority: 'LOW' },
      { title: 'Gestión de residuos', priority: 'LOW' },
      { title: 'Certificaciones de calidad', priority: 'HIGH' },
      { title: 'Plan de mejora continua', priority: 'LOW' }
    ]
  },
  {
    id: 'tpl_07',
    name: 'Finanzas Trimestral',
    process: 'Finanzas',
    checkCount: 12,
    checksPreview: [
      { title: 'Conciliación bancaria mensual', priority: 'HIGH' },
      { title: 'Revisión de partidas pendientes', priority: 'MEDIUM' },
      { title: 'Control de caja', priority: 'HIGH' },
      { title: 'Aprobación de pagos', priority: 'HIGH' },
      { title: 'Declaraciones fiscales al día', priority: 'HIGH' },
      { title: 'Presupuesto vs real', priority: 'MEDIUM' },
      { title: 'Cierre contable mensual', priority: 'MEDIUM' },
      { title: 'Gestión de cobros', priority: 'MEDIUM' },
      { title: 'Segregación de funciones', priority: 'HIGH' },
      { title: 'Reporting mensual', priority: 'MEDIUM' },
      { title: 'Control de gastos representación', priority: 'LOW' },
      { title: 'Auditoría de activos fijos', priority: 'LOW' }
    ]
  },
  {
    id: 'tpl_08',
    name: 'IT Infraestructura',
    process: 'IT',
    checkCount: 13,
    checksPreview: [
      { title: 'Inventario de software', priority: 'HIGH' },
      { title: 'Licencias vigentes', priority: 'HIGH' },
      { title: 'Política de actualizaciones', priority: 'HIGH' },
      { title: 'Accesos privilegiados', priority: 'HIGH' },
      { title: 'Plan de recuperación ante desastres', priority: 'HIGH' },
      { title: 'Monitorización de sistemas', priority: 'MEDIUM' },
      { title: 'Control de cambios en producción', priority: 'HIGH' },
      { title: 'Pruebas de penetración', priority: 'MEDIUM' },
      { title: 'Seguridad en el desarrollo', priority: 'MEDIUM' },
      { title: 'Gestión de certificados SSL', priority: 'MEDIUM' },
      { title: 'Documentación técnica', priority: 'LOW' },
      { title: 'SLAs de proveedores TI', priority: 'LOW' },
      { title: 'Gestión de capacidad', priority: 'MEDIUM' }
    ]
  }
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function rand<T> (arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

function randomDate (start: Date, end: Date): string {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString()
}

// server/api/_data.ts

function generateChecks (auditId: string, template: Template, status: AuditStatus): Check[] {
  return template.checksPreview.map((c, i) => {
    // Si la auditoría ya está DONE, ponemos OK.
    // Si no, SIEMPRE PENDING. No uses Math.random aquí.
    const checkStatus: CheckStatus = status === 'DONE' ? 'OK' : 'PENDING'

    return {
      // ID con ceros para mantener el orden (chk_01, chk_02...)
      id: `chk_${auditId}_${(i + 1).toString().padStart(2, '0')}`,
      auditId,
      title: c.title,
      priority: c.priority,
      status: checkStatus,
      evidence: checkStatus === 'OK' ? 'Verificado.' : '',
      reviewed: checkStatus === 'OK',
      updatedAt: new Date().toISOString()
    }
  })
}

function computeProgress (status: AuditStatus, checks: Check[]): number {
  if (status === 'DRAFT') { return 0 }
  if (status === 'DONE') { return 100 }
  const done = checks.filter(c => c.status === 'OK' || c.status === 'KO').length
  return checks.length > 0 ? Math.round((done / checks.length) * 100) : 0
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

let _audits: Audit[] | null = null
let _checks: Record<string, Check[]> | null = null

const statusPool: { s: AuditStatus; w: number }[] = [
  { s: 'DRAFT', w: 0.2 },
  { s: 'IN_PROGRESS', w: 0.4 },
  { s: 'DONE', w: 0.3 },
  { s: 'BLOCKED', w: 0.1 }
]

function weightedStatus (): AuditStatus {
  const r = Math.random()
  let acc = 0
  for (const { s, w } of statusPool) {
    acc += w
    if (r < acc) { return s }
  }
  return 'DRAFT'
}

const auditNames = [
  'ISO 27001', 'SOX', 'GDPR', 'PCI-DSS', 'Revisión Interna',
  'Control Financiero', 'Auditoría Anual', 'Cumplimiento Legal',
  'Evaluación de Riesgos', 'Audit Q1', 'Audit Q2'
]

// 2. Asegura que el progreso se calcula SIEMPRE sobre los checks generados
function build () {
  const audits: Audit[] = []
  const checks: Record<string, Check[]> = {}

  for (let i = 1; i <= 60; i++) {
    const tpl = rand(TEMPLATES)
    let status = weightedStatus() // Decidimos el estado una sola vez
    const owner = rand(OWNERS)
    const id = `aud_${1000 + i}`

    // Generamos los checks para ese estado
    const chks = generateChecks(id, tpl, status)

    // REGLA DE ORO: Si generamos checks y hay algún KO, el estado NO puede ser DONE
    const hasKO = chks.some(c => c.status === 'KO')
    if (status === 'DONE' && hasKO) {
      status = 'IN_PROGRESS'
    }

    checks[id] = chks
    audits.push({
      id,
      name: `${rand(auditNames)} - ${tpl.process}`,
      process: tpl.process,
      status,
      progress: computeProgress(status, chks),
      owner,
      targetDate: randomDate(new Date('2026-02-01'), new Date('2026-06-30')).split('T')[0],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      templateId: tpl.id
    })
  }
  return { audits, checks }
}

export function getDb () {
  if (!_audits || !_checks) {
    const r = build()
    _audits = r.audits
    _checks = r.checks
  }
  // IMPORTANTE: Devolver siempre los checks ordenados por ID
  Object.keys(_checks).forEach((id) => {
    _checks![id].sort((a, b) => a.id.localeCompare(b.id))
  })
  return { audits: _audits!, checks: _checks! }
}
