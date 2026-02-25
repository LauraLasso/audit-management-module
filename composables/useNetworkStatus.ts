const isOnline = ref(true)

export function useNetworkStatus () {
  return { isOnline }
}
