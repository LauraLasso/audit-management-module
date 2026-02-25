<template>
  <div class="space-y-3">
    <Skeleton v-for="i in (rows ?? 8)" :key="i" height="3.5rem" border-radius="0.5rem" />
  </div>
</template>
<script setup lang="ts">
defineProps<{ rows?: number }>()
</script>
