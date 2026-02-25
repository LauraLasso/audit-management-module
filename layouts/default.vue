<template>
  <div style="display:flex; height:100vh; overflow:hidden; width:100%;">
    <AppSidebar :collapsed="collapsed" />
    <div style="display:flex; flex-direction:column; flex:1; min-width:0; overflow:hidden;">
      <AppTopbar @toggle="collapsed = !collapsed" />
      <main style="flex:1; overflow-y:auto; padding:1.5rem;">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const collapsed = ref(false)
const { loadAll } = useAuditStore()

let interval: ReturnType<typeof setInterval>

onMounted(async () => {
  await loadAll()
  // Recargar store cada 60s para mantener notificaciones actualizadas
  interval = setInterval(loadAll, 60_000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
