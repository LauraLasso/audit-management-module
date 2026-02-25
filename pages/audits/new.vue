<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Breadcrumb -->
    <div>
      <NuxtLink
        to="/audits"
        class="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1"
      >
        <i class="pi pi-arrow-left text-xs" /> Volver a auditorías
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 mt-2">
        Nueva auditoría
      </h1>
    </div>

    <!-- Steps -->
    <div class="flex items-center gap-2">
      <template v-for="(step, idx) in steps" :key="idx">
        <div class="flex items-center gap-2">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
              currentStep > idx ? 'bg-green-500 text-white' :
              currentStep === idx ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400',
            ]"
          >
            <i v-if="currentStep > idx" class="pi pi-check text-xs" />
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span :class="['text-sm font-medium', currentStep === idx ? 'text-gray-900' : 'text-gray-400']">
            {{ step }}
          </span>
        </div>
        <i v-if="idx < steps.length - 1" class="pi pi-chevron-right text-gray-300 text-xs mx-1" />
      </template>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <!-- STEP 1: Datos básicos -->
      <form v-if="currentStep === 0" class="space-y-5" @submit.prevent="goStep2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="name">
            Nombre <span class="text-red-500">*</span>
          </label>
          <InputText
            id="name"
            v-model="form.name"
            class="w-full"
            :invalid="submitted && !form.name.trim()"
            placeholder="Ej. Auditoría ISO 27001 - Compras"
          />
          <small v-if="submitted && !form.name.trim()" class="text-red-500 text-xs mt-1 block">
            El nombre es obligatorio (mínimo 3 caracteres)
          </small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="process">
            Proceso <span class="text-red-500">*</span>
          </label>
          <Dropdown
            id="process"
            v-model="form.process"
            :options="PROCESSES"
            placeholder="Selecciona un proceso"
            class="w-full"
            :invalid="submitted && !form.process"
          />
          <small v-if="submitted && !form.process" class="text-red-500 text-xs mt-1 block">
            Campo obligatorio
          </small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="owner">
            Responsable <span class="text-red-500">*</span>
          </label>
          <Dropdown
            id="owner"
            v-model="form.ownerId"
            :options="OWNERS"
            option-label="name"
            option-value="id"
            placeholder="Selecciona un responsable"
            class="w-full"
            :invalid="submitted && !form.ownerId"
          />
          <small v-if="submitted && !form.ownerId" class="text-red-500 text-xs mt-1 block">
            Campo obligatorio
          </small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="date">
            Fecha límite <span class="text-red-500">*</span>
          </label>
          <Calendar
            id="date"
            v-model="form.targetDateObj"
            date-format="dd/mm/yy"
            class="w-full"
            :min-date="new Date()"
            :invalid="submitted && !form.targetDateObj"
          />
          <small v-if="submitted && !form.targetDateObj" class="text-red-500 text-xs mt-1 block">
            Campo obligatorio
          </small>
        </div>

        <div class="flex justify-end pt-2">
          <Button label="Siguiente" icon="pi pi-arrow-right" icon-pos="right" type="submit" />
        </div>
      </form>

      <!-- STEP 2: Selección de plantilla -->
      <div v-else class="space-y-5">
        <div v-if="tplLoading" class="py-8">
          <SkeletonTable :rows="5" />
        </div>

        <ErrorState v-else-if="tplError" :message="tplError" @retry="fetchTpls" />

        <template v-else>
          <p class="text-sm text-gray-600">
            Selecciona la plantilla de checks que se aplicará a esta auditoría.
          </p>

          <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
            <div
              v-for="(tpl, idx) in templates"
              :key="tpl.id"
              :ref="el => { if (el) tplRefs[idx] = el as HTMLElement }"
              tabindex="0"
              role="radio"
              :aria-checked="form.templateId === tpl.id"
              :class="[
                'border-2 rounded-xl p-4 cursor-pointer transition-all',
                'focus-visible:ring-2 focus-visible:ring-indigo-500',
                form.templateId === tpl.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300',
              ]"
              @click="form.templateId = tpl.id"
              @keydown.enter="form.templateId = tpl.id"
              @keydown.space.prevent="form.templateId = tpl.id"
              @keydown.arrow-down.prevent="focusNextTpl(idx)"
              @keydown.arrow-up.prevent="focusPrevTpl(idx)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-sm text-gray-900">{{ tpl.name }}</span>
                    <Tag :value="tpl.process" severity="secondary" />
                    <span class="text-xs text-gray-400">{{ tpl.checkCount }} checks</span>
                  </div>
                  <div class="flex flex-wrap gap-1 mt-2">
                    <span
                      v-for="c in tpl.checksPreview.slice(0, 3)"
                      :key="c.title"
                      class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {{ c.title }}
                    </span>
                    <span
                      v-if="tpl.checksPreview.length > 3"
                      class="text-xs text-gray-400"
                    >
                      +{{ tpl.checksPreview.length - 3 }} más
                    </span>
                  </div>
                </div>
                <div
                  :class="[
                    'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all',
                    form.templateId === tpl.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300',
                  ]"
                >
                  <i v-if="form.templateId === tpl.id" class="pi pi-check text-white text-xs" />
                </div>
              </div>
            </div>
          </div>

          <small v-if="tplSubmitted && !form.templateId" class="text-red-500 text-xs block">
            Debes seleccionar una plantilla
          </small>

          <div class="flex justify-between pt-2">
            <Button label="Atrás" icon="pi pi-arrow-left" outlined @click="currentStep = 0" />
            <Button
              label="Crear auditoría"
              icon="pi pi-check"
              :loading="saving"
              :disabled="saving"
              @click="submit"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { OWNERS, PROCESSES } from '~/utils/data'

const toast = useToast()
const steps = ['Datos básicos', 'Selección de plantilla']

// Estado del wizard
const currentStep = ref(0)
const submitted = ref(false)
const tplSubmitted = ref(false)

const form = reactive({
  name: '',
  process: '',
  ownerId: '',
  targetDateObj: null as Date | null,
  templateId: ''
})

// Validación step 1
function goStep2 () {
  submitted.value = true
  if (!form.name.trim() || form.name.length < 3) { return }
  if (!form.process) { return }
  if (!form.ownerId) { return }
  if (!form.targetDateObj) { return }
  currentStep.value = 1
  fetchTpls()
}

// Plantillas
const { templates, loading: tplLoading, error: tplError, fetch: fetchTpls } = useTemplates()

// Submit
const saving = ref(false)
const { create } = useCreateAudit()

async function submit () {
  tplSubmitted.value = true
  if (!form.templateId) { return }

  saving.value = true
  try {
    const audit = await create({
      name: form.name.trim(),
      process: form.process,
      ownerId: form.ownerId,
      targetDate: form.targetDateObj!.toISOString().split('T')[0] ?? '',
      templateId: form.templateId
    })
    toast.add({
      severity: 'success',
      summary: 'Auditoría creada',
      detail: audit.name,
      life: 3000
    })
    await navigateTo(`/audits/${audit.id}`)
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Error al crear',
      detail: e.data?.statusMessage ?? e.message,
      life: 4000
    })
  } finally {
    saving.value = false
  }
}
const tplRefs = ref<HTMLElement[]>([])

function focusNextTpl (idx: number) {
  tplRefs.value[idx + 1]?.focus()
}

function focusPrevTpl (idx: number) {
  tplRefs.value[idx - 1]?.focus()
}
</script>
