<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAcceptanceStore } from './stores/acceptance'

const route = useRoute()
const store = useAcceptanceStore()
const title = computed(() => route.path.startsWith('/equipment') ? '设备树与验收项' : route.path.startsWith('/defects') ? '缺陷闭环处置' : route.path.startsWith('/sync') ? '验收车离线签署与回传' : route.path.startsWith('/audit') ? '移交与审计' : '并网验收总览')
onMounted(() => store.hydrate())
</script>

<template>
  <div class="app-shell">
    <aside>
      <div class="brand"><b>光</b><div><strong>并网验收工作台</strong><small>设备、测试、证书与缺陷闭环</small></div></div>
      <nav>
        <NuxtLink to="/"><span>验收总览</span><small>{{ store.stats.total }}项</small></NuxtLink>
        <NuxtLink to="/equipment"><span>设备与测试</span><small>设备树</small></NuxtLink>
        <NuxtLink to="/defects"><span>缺陷闭环</span><small>{{ store.stats.openDefects }}项</small></NuxtLink>
        <NuxtLink to="/sync"><span>验收车签署回传</span><small>离线·换版合并</small></NuxtLink>
        <NuxtLink to="/audit"><span>签署与审计</span><small>V{{ store.plant.version }}</small></NuxtLink>
      </nav>
      <div class="aside-state"><span>并网前完整性检查</span><strong>{{ store.preflight.allowed ? '允许申请复核' : `${store.preflight.blocking.length}项阻断` }}</strong><small>{{ store.plant.name }}</small></div>
    </aside>
    <main>
      <header class="top"><div><span>电站工程中心 / 验收与交付</span><h1>{{ title }}</h1></div><div class="top-user"><small>验收负责人</small><strong>陆川</strong></div></header>
      <NuxtPage />
    </main>
  </div>
</template>
