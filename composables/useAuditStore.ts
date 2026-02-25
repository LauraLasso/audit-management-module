const audits = ref<any[]>([])
const loaded = ref(false)

export function useAuditStore () {
  const { isOnline } = useNetworkStatus()

  async function loadAll () {
    if (!isOnline.value) { return }

    try {
      const res = await $fetch<any>('/api/audits', {
        params: { page: 1, pageSize: 200 }
      })
      audits.value = res?.items ?? []
      loaded.value = true
    } catch {
      loaded.value = false
    }
  }

  function updateAudit (id: string, patch: Record<string, any>) {
    const idx = audits.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      Object.assign(audits.value[idx], patch)
    }
  }

  function invalidate () {
    loaded.value = false
  }

  return { audits, loadAll, updateAudit, invalidate }
}
