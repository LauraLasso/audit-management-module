# Audit Manager

Módulo de gestión de auditorías. Interfaz tipo producto real para crear, listar y ejecutar auditorías con checklists, consumiendo una API 100% simulada con comportamiento realista y persistencia en memoria.

---

## Arranque rápido
### Desarrollo
Para trabajar en el proyecto con recarga en caliente:
```bash
# Instalar dependencias
npm install

# Arrancar en desarrollo
npm run dev
```
### Producción (local)
```bash
npm run build
npm run preview
```
La app estará disponible en http://localhost:3000.

## Docker
El proyecto incluye un entorno virtualizado que realiza un pipeline completo: Linting -> Unit Tests -> Build.

```bash
# Construcción (ejecuta Vitest y Linter automáticamente)
docker build -t audit-manager .

# Ejecución del servicio
docker run -d -p 3000:3000 --name audit-app audit-manager
```

## Stack tecnológico
| Tecnología | Elección | Justificación |
| :--- | :--- | :--- |
| **Framework** | Nuxt 3 | Uso de **Nitro Engine** para la Mock API, garantizando que las peticiones se vean en la pestaña *Network* como si fueran reales. |
| **UI Library** | PrimeVue 4 | Proporciona componentes de alta fidelidad (Stepper, DataTable, Tooltips) necesarios para un acabado de "producto real". |
| **Estilos** | Tailwind CSS | Agilidad en la maquetación y control total sobre la jerarquía visual y espaciados. |
| **Estado** | Composables | Se ha evitado Pinia para reducir el boilerplate, usando `reactive` compartido, suficiente para la escala del módulo. |
| **Tests** | Vitest | Validación de la lógica de cálculo de progreso y coherencia de estados. |

## Estructura del proyecto

```text
├── components/
│   ├── AppSidebar.vue          # Navegación lateral colapsable
│   ├── AppTopbar.vue           # Header con notificaciones, reloj y config. del simulador
│   ├── AuditCard.vue           # Card interactiva con KPI de progreso y alertas de vencimiento
│   ├── AuditStatusBadge.vue    # Badge de estado reutilizable
│   ├── CheckPriorityBadge.vue  # Badge de prioridad (HIGH, MEDIUM, LOW)
│   ├── CheckRow.vue            # Item de checklist con estados animados
│   ├── SkeletonTable.vue       # Skeleton loader para transiciones de carga
│   ├── ErrorState.vue          # Estado de error con botón de reintento
│   └── EmptyState.vue          # Estado vacío con llamada a la acción (CTA)
│
├── composables/
│   ├── useAuditApi.ts          # Lógica central de comunicación con la API
│   ├── useAuditStore.ts        # Almacenamiento global para sincronización de estados entre vistas
│   ├── useNetworkStatus.ts     # Detección de conectividad (Online/Offline)
│   ├── useNotifications.ts     # Sistema de alertas para fechas de vencimiento
│   └── useSimulatorConfig.ts   # Estado global de los parámetros del simulador
│
├── pages/
│   ├── index.vue               # Dashboard principal con KPIs de resumen
│   └── audits/
│       ├── index.vue           # Listado con filtros avanzados y persistencia en URL
│       ├── new.vue             # Wizard de creación (Datos → Plantilla)
│       └── [id].vue            # Detalle, gestión de checks y simulación automática
│
├── server/
│   └── api/                    # Mock API robusta mediante Nitro Server Routes
│       ├── _data.ts            # BD en memoria, generación de mocks y lógica de negocio server-side
│       ├── audits.get.ts       # Endpoint de listado: implementa filtrado, paginación y latencia simulada
│       ├── audits.post.ts      # Endpoint de creación: vincula plantillas y genera checks iniciales
│       ├── templates.get.ts    # Endpoint de catálogos: sirve las plantillas y modelos de auditoría
│       ├── usuarios.ts         # Proxy de API: consumo seguro de datos externos desde el servidor
│       └── audits/             # Recursos dinámicos: consulta de detalle, ejecución y edición de controles
│
├── tests/
│   └── utils.test.ts           # Pruebas unitarias de lógica crítica (Vitest)
├── utils/
│   └── data.ts                 # Datos maestros: catálogos compartidos de usuarios y procesos
│       
│
├── layouts/
│   └── default.vue             # Layout base con gestión de scroll optimizada
└── Dockerfile                  # Pipeline de CI (Lint → Test → Build)
```

## Funcionalidades implementadas (Obligatorio + Todos los Bonus)
### Listado y Gestión Global
* Filtros persistidos: Sincronización bidireccional entre filtros y Query Params (?q=&status=&process=&page=)
* Dashboard de KPIs: Resumen visual (totales, en curso, completadas, incidencias)
* Notificaciones: Alertas en Topbar para auditorías vencidas o próximas
* Estados de UI: skeleton loader, error (reintento), empty state (CTA)
* Fechas vencidas resaltadas en rojo

### Wizard de Creación
* Flujo validado: 2 pasos con validación estricta (datos → plantilla)
* Preview de plantillas: Visualización de checks antes de confirmar
* Redirige al detalle tras creación exitosa

### Detalle y Simulación Atómica
* Ejecución automática: QUEUED → RUNNING → OK/KO check a check
* Determinismo: Resultados pre-calculados para consistencia en contadores
* Persistencia real: PATCH guardados en Singleton del servidor Nitro
* Marcado manual OK/KO + campo de evidencia editable

### UI Optimista + Rollback
* Checks actualizados localmente antes de PATCH
* Rollback automático si falla la API (según tasa de error configurada)
* Toast de error visible con restauración del estado anterior

### Modo Offline
* Detección automática de pérdida de red (useNetworkStatus)
* Último listado cacheado en memoria + banner de aviso
* Cambios no persisten hasta restaurar conexión

### Configuración del Simulador (Bonus único)
Panel en Topbar con sliders configurables:
* Tasa de error API: 0%–50% probabilidad de fallo de red
* Tasa de KO: 0%–100% probabilidad de fallo en checks automáticos
* Modo Offline: Toggle para simular pérdida de conectividad

## API simulada (Nitro Server Routes)
Ubicada en server/api/, implementa un comportamiento realista:
* Latencia Variable: Retrasos aleatorios entre 300ms y 1200ms por cada petición.
* Errores Aleatorios: Tasa de fallo configurable (10-50%) para testear la robustez de la UI.
* Paginación Real: El servidor Nitro filtra el dataset de 60 auditorías y devuelve solo el segmento solicitado.

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/audits` | Listado paginado con soporte de filtros complejos. |
| `GET` | `/api/audits/:id` | Detalle completo de la auditoría y sus checks asociados. |
| `POST` | `/api/audits` | Crea una nueva auditoría y genera los checks en `PENDING`. |
| `POST` | `/api/audits/:id/run` | Disparador oficial del proceso de ejecución simulada. |
| `PATCH` | `/api/audits/:id/checks/:cId` | Persistencia real de estado de checks y evidencias. |
| `GET` | `/api/templates` | Listado de plantillas con previsualización de sus checks. |

## Reglas de coherencia y datos
Se ha generado un dataset robusto para demostrar la potencia de los filtros:
* 60+ Auditorías distribuidas en procesos de Compras, Seguridad, RRHH y Operaciones.
* 10 Responsables diferentes.
* 8 Plantillas con lógicas de checks variadas (10 a 30 por auditoría).

| Estado | Progreso | Lógica de negocio |
| :--- | :--- | :--- |
| **`DRAFT`** | 0% | Estado inicial tras la creación, antes de cualquier ejecución. |
| **`IN_PROGRESS`** | 1–99% | Calculado dinámicamente según checks completados (OK + KO). |
| **`DONE`** | 100% | Todos los checks han finalizado con éxito (Estado OK). |
| **`BLOCKED`** | Variable | Estado asignado manualmente o generado en el dataset inicial. |

Testeado: tests/unit/utils.test.ts

### Estructura de datos
#### Auditoría (Audit)
Representa la entidad principal de la inspección:
```json
{
  "id": "aud_1001",
  "name": "Auditoría ISO 27001",
  "status": "DRAFT",
  "progress": 0,
  "owner": { "id": "u_1", "name": "Ana López" },
  "targetDate": "2026-03-20"
}
```

#### Evaluación (Check)
Cada uno de los puntos verificables dentro de una auditoría.
```json
{
  "id": "chk_501",
  "status": "PENDING | QUEUED | RUNNING | OK | KO",
  "priority": "HIGH | MEDIUM | LOW",
  "evidence": "Texto de prueba",
  "reviewed": false
}
```

## Calidad de código y UI
* Linter estricto: ESLint (StandardJS) + pre-commit hook
* Layout fluido: overflow: hidden + scrollbar-gutter: stable → sin saltos visuales
* Tooltips contextuales: Ayuda en botones críticos
* Tests Vitest: Lógica de negocio + filtros validados
* Docker CI: Lint → Test → Build automatizado

## Decisiones técnicas y trade-offs
* Nitro Server Routes vs Client-side mocks → Persistencia real entre páginas + devtools de red nativos
* Composables reactivos → Sin boilerplate de Pinia, estado compartido automático
* UI optimista + rollback → Feedback inmediato con seguridad de datos
* Docker multi-stage → Imagen ~200MB lista para prod (lint+test incluidos)
* Simulador configurable → Demuestra manejo de errores reales sin mocks estáticos

## Mejoras futuras
* LocalStorage → Persistencia de dataset tras reinicio del servidor
* Exportación → PDF/Excel de auditorías finalizadas
* Roles → Admin/Auditor con permisos diferenciados
* E2E → Playwright para flujo completo (crear → ejecutar → DONE)
* Realtime → WebSocket simulado para ejecución colaborativa
