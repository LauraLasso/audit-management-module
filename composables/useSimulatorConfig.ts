const errorRate = ref(0.12)
const koRate = ref(0.15)

export function useSimulatorConfig () {
  return { errorRate, koRate }
}
