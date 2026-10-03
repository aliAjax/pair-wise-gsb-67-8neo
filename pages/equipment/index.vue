<script setup lang="ts">
import { useAcceptanceStore } from '../../stores/acceptance'

const store = useAcceptanceStore()
await navigateTo(`/equipment/${store.equipment[0]?.id ?? 'EQ-GRID'}`, { replace: true })
</script>

<template>
  <section class="page">正在打开设备树...</section>
</template>
