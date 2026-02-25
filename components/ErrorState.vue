<template>
  <div class="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
      <i class="pi pi-exclamation-triangle text-2xl text-red-500" />
    </div>
    <div>
      <p class="font-semibold text-gray-700 text-lg">
        Algo ha salido mal
      </p>
      <p class="text-gray-500 text-sm mt-1">
        {{ message ?? 'Error desconocido' }}
      </p>
    </div>
    <Button label="Reintentar" icon="pi pi-refresh" @click="$emit('retry')" />
  </div>
</template>
<script setup lang="ts">
defineProps<{ message?: string }>()
defineEmits(['retry'])
</script>
