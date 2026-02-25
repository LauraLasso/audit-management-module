<template>
  <aside :class="['flex flex-col bg-slate-900 text-white transition-all duration-300 shrink-0', collapsed ? 'w-16' : 'w-64']">
    <div class="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
      <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
        <i class="pi pi-shield text-white text-sm" />
      </div>
      <span v-if="!collapsed" class="font-bold text-lg tracking-tight">AuditApp</span>
    </div>

    <nav class="flex-1 py-4 space-y-1 px-2">
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        active-class="bg-indigo-600 text-white hover:bg-indigo-600"
      >
        <i :class="['pi', item.icon, 'text-base shrink-0']" />
        <span v-if="!collapsed" class="text-sm font-medium">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="p-4 border-t border-slate-700">
      <div v-if="!collapsed" class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
          A
        </div>
        <div class="text-xs">
          <div class="font-medium">
            Admin
          </div>
          <div class="text-slate-400">
            admin@auditapp.io
          </div>
        </div>
      </div>
      <div v-else class="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold mx-auto">
        A
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean }>()

const nav = [
  { to: '/', icon: 'pi-home', label: 'Inicio' },
  { to: '/audits', icon: 'pi-list-check', label: 'Auditorías' },
  { to: '/audits/new', icon: 'pi-plus-circle', label: 'Nueva auditoría' }
]

</script>
