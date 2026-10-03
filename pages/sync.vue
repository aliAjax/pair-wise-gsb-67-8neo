<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useAcceptanceStore } from '../stores/acceptance'
import type { SignBatch } from '../types/domain'

const store = useAcceptanceStore()
const toast = useToast()
const selected = ref<SignBatch | null>(null)
const batchSeverity = (status: string) => status === '已合并' ? 'success' : status === '已确认' ? 'info' : status === '待复核' ? 'danger' : status === '部分回传' ? 'warn' : 'secondary'
const entrySeverity = (status: string) => status === '已合并' ? 'success' : status === '冲突' ? 'danger' : status === '已失效重算' ? 'info' : 'secondary'
const progress = (batch: SignBatch) => `${batch.entries.filter((entry) => entry.status !== '待回传').length} / ${batch.entries.length}`

function create() {
  const result = store.createOfflineBatch('验收负责人陆川')
  toast.add({ severity: 'success', summary: result.message, life: 3000 })
}
function sync(batch: SignBatch, failAfter?: number) {
  const result = store.syncBatch(batch.id, failAfter === undefined ? {} : { failAfter })
  toast.add({ severity: result.ok ? 'success' : 'warn', summary: result.message, life: 3500 })
}
function confirm(batch: SignBatch) {
  const result = store.confirmBatch(batch.id, '建设单位')
  toast.add({ severity: result.ok ? 'success' : 'error', summary: result.message, life: 3500 })
}
const conflicts = computed(() => selected.value?.conflicts ?? [])
</script>

<template>
  <section class="page">
    <div class="section-head">
      <div><h2>离线签署与回传合并</h2><p>验收车现场离线签署，缺陷、验收项、证书与多方回复绑成一份依据，只记录实际看到的版本；网络恢复后逐项合并，任何版本变化整批退回待复核。</p></div>
      <Button label="现场离线签署" icon="pi pi-pencil" @click="create" />
    </div>
    <DataTable :value="store.batches" dataKey="id" size="small" selectionMode="single" @rowSelect="(event: any) => (selected = event.data)">
      <Column field="id" header="签署批次" />
      <Column header="签署时间"><template #body="{ data }">{{ data.createdAt.replace('T', ' ').slice(0, 16) }}</template></Column>
      <Column field="createdBy" header="签署人" />
      <Column header="回传进度"><template #body="{ data }">{{ progress(data) }}</template></Column>
      <Column header="冲突"><template #body="{ data }"><Tag :value="`${data.conflicts.length}处`" :severity="data.conflicts.length ? 'danger' : 'success'" /></template></Column>
      <Column header="状态"><template #body="{ data }"><Tag :value="data.status" :severity="batchSeverity(data.status)" /></template></Column>
      <Column header="操作">
        <template #body="{ data }">
          <Button v-if="data.status === '待回传' || data.status === '部分回传'" label="回传合并" text @click="sync(data)" />
          <Button v-if="data.status === '待回传'" label="模拟中断" text severity="warn" @click="sync(data, 2)" />
          <Button v-if="data.status === '待复核'" label="建设单位确认" text severity="danger" @click="confirm(data)" />
        </template>
      </Column>
    </DataTable>
    <p v-if="!store.batches.length">暂无离线签署批次。在现场点击「现场离线签署」生成依据批次，回传前可先到设备或缺陷页面修改数据模拟换版。</p>

    <div v-if="selected" class="detail-panel">
      <div class="detail-title"><div><span>{{ selected.id }} · {{ selected.status }}</span><h3>签署依据（现场实际看到的版本）</h3></div><small v-if="selected.confirmedAt">建设单位 {{ selected.confirmedBy }} 于 {{ selected.confirmedAt.replace('T', ' ').slice(0, 16) }} 确认</small></div>
      <DataTable :value="selected.entries" dataKey="key" size="small">
        <Column field="kind" header="依据类型" />
        <Column field="entityId" header="对象" />
        <Column header="现场版本"><template #body="{ data }">V{{ data.seenVersion }}</template></Column>
        <Column field="conclusion" header="离线结论" />
        <Column header="状态"><template #body="{ data }"><Tag :value="data.status" :severity="entrySeverity(data.status)" /></template></Column>
        <Column header="合并时间"><template #body="{ data }">{{ data.mergedAt ? data.mergedAt.replace('T', ' ').slice(0, 16) : '—' }}</template></Column>
      </DataTable>
    </div>

    <div v-if="conflicts.length" class="detail-panel">
      <div class="detail-title"><div><span>版本冲突留痕</span><h3>旧结论与两版内容均保留</h3></div></div>
      <DataTable :value="conflicts" dataKey="id" size="small">
        <Column field="kind" header="类型" />
        <Column field="entityId" header="对象" />
        <Column header="版本"><template #body="{ data }">现场V{{ data.seenVersion }} → 线上V{{ data.currentVersion }}</template></Column>
        <Column field="offlineConclusion" header="离线旧结论" />
        <Column field="currentConclusion" header="线上当前结论" />
        <Column header="处置"><template #body="{ data }"><Tag :value="data.resolved ? '已失效重算' : '待建设单位确认'" :severity="data.resolved ? 'info' : 'danger'" /></template></Column>
      </DataTable>
    </div>
  </section>
</template>
