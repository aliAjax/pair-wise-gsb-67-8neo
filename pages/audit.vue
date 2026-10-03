<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useAcceptanceStore } from '../stores/acceptance'

const store = useAcceptanceStore()
const toast = useToast()
const keyword = ref('')
const rows = computed(() => store.audit.filter((item) => !keyword.value || `${item.entityId} ${item.action} ${item.operator} ${item.detail}`.includes(keyword.value)))
const sign = () => {
  const result = store.signOff()
  toast.add({ severity: result.ok ? 'success' : 'error', summary: result.ok ? '签署完成' : '完整性校验未通过', detail: result.message, life: 4000 })
}
const exportPackage = () => {
  const payload = { plant: store.plant, equipment: store.equipment, defects: store.defects, audit: store.audit, batches: store.batches, preflight: store.preflight }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = '光伏并网验收交付包.json'; anchor.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="page">
    <div class="preflight-panel">
      <div><span>并网前完整性校验</span><strong>{{ store.preflight.allowed ? '全部条件满足' : `${store.preflight.blocking.length}项阻断` }}</strong><p v-for="item in store.preflight.blocking" :key="item">{{ item }}</p></div>
      <div><Button label="导出交付包" outlined @click="exportPackage" /><Button label="签署并锁定版本" @click="sign" /></div>
    </div>
    <div class="section-head"><div><h2>验收审计</h2><p>当前交付版本 V{{ store.plant.version }} · {{ store.plant.status }}</p></div><InputText v-model="keyword" placeholder="搜索实体、动作或操作人" /></div>
    <DataTable :value="rows" dataKey="id" size="small">
      <Column field="createdAt" header="时间"><template #body="{ data }">{{ data.createdAt.replace('T', ' ').slice(0, 16) }}</template></Column>
      <Column field="entityId" header="实体" />
      <Column field="action" header="动作"><template #body="{ data }"><Tag :value="data.action" /></template></Column>
      <Column field="operator" header="操作人" />
      <Column field="detail" header="说明" />
    </DataTable>
  </section>
</template>
