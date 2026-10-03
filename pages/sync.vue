<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import { useSyncStore } from '../stores/sync'
import type { MergeState, SigningBatch, VersionConflict } from '../types/sync'

const sync = useSyncStore()
const toast = useToast()
sync.hydrate()

const signSite = ref('沙岭110kV升压站现场')
const signer = ref('陆川（现场）')
const selectedBatch = ref<SigningBatch | null>(null)
const detailVisible = ref(false)
const conflictVisible = ref(false)
const activeConflict = ref<VersionConflict | null>(null)
const opinion = ref('')
const recomputeForm = reactive<Record<string, { status: string; measured: string; evidence: string; result: string; passed: boolean; note: string; verified: boolean; content: string }>>({})

const stateTag: Record<MergeState, 'success' | 'warn' | 'danger' | 'info' | 'secondary'> = {
  未回传: 'secondary',
  合并一致: 'success',
  版本冲突: 'danger',
  待写入: 'warn',
  写入失败: 'danger',
  已失效待重算: 'warn',
  重算完成待放行: 'info',
  已放行: 'success'
}
const batchTag = computed<Record<string, 'success' | 'warn' | 'danger' | 'info' | 'secondary'>>(() => ({
  离线待回传: 'secondary',
  回传中: 'warn',
  回传中断: 'danger',
  退回待复核: 'danger',
  待重算: 'warn',
  重算完成待放行: 'info',
  已放行: 'success'
}))

function form(conflict: VersionConflict) {
  if (!recomputeForm[conflict.id]) {
    recomputeForm[conflict.id] = { status: '合格', measured: '', evidence: '', result: '', passed: true, note: '', verified: true, content: '' }
  }
  return recomputeForm[conflict.id]
}

async function download() {
  await sync.downloadBaseline()
  toast.add({ severity: 'success', summary: '基线已下载', detail: sync.message, life: 3500 })
}
function doSign() {
  const result = sync.signOfflineBatch(signer.value, signSite.value)
  toast.add({ severity: result.ok ? 'success' : 'error', summary: result.message, life: 3500 })
}
function drift() {
  const notes = sync.applyCloudDrift()
  notes.forEach((note) => toast.add({ severity: 'warn', summary: '平台换版', detail: note, life: 5000 }))
}
async function merge(batch: SigningBatch) {
  await sync.mergeBatch(batch.id)
  toast.add({ severity: batch.status === '退回待复核' ? 'warn' : batch.status === '回传中断' ? 'danger' : 'success', summary: sync.message, life: 4000 })
}
function openBatch(batch: SigningBatch) { selectedBatch.value = batch; detailVisible.value = true }
function openConflict(conflict: VersionConflict) { activeConflict.value = conflict; opinion.value = ''; form(conflict); conflictVisible.value = true }

function confirm() {
  if (!activeConflict.value) return
  sync.confirmConflict(selectedBatch.value!.id, activeConflict.value.id, opinion.value)
  toast.add({ severity: 'warn', summary: '建设单位已确认', detail: '仅该受影响对象失效重算，旧结论与两版冲突已留存', life: 4000 })
}function doRecompute() {
  const batch = selectedBatch.value!
  const conflict = activeConflict.value!
  const f = form(conflict)
  if (conflict.kind === '验收项') {
    if (!f.measured || !f.evidence) { toast.add({ severity: 'error', summary: '请填写实测结果与证据' }); return }
    sync.recomputeItem(batch.id, conflict.id, { status: f.status as any, measured: f.measured, evidence: f.evidence })
  } else if (conflict.kind === '证书') {
    sync.recomputeCertificate(batch.id, conflict.id, f.verified)
  } else if (conflict.kind === '缺陷') {
    if (!f.result) { toast.add({ severity: 'error', summary: '请填写复验结果' }); return }
    sync.recomputeDefect(batch.id, conflict.id, f.result, f.passed, f.note)
  } else {
    if (!f.content || !f.evidence) { toast.add({ severity: 'error', summary: '请填写新版回复内容与证据' }); return }
    sync.recomputeReplyConflict(batch.id, conflict.id, f.content, f.evidence)
  }
  toast.add({ severity: 'success', summary: '受影响对象已按新版重算', life: 3500 })
  activeConflict.value = null
  conflictVisible.value = false
}
async function release(batch: SigningBatch) {
  const result = await sync.releaseBatch(batch.id)
  toast.add({ severity: result.ok ? 'success' : 'error', summary: result.message, life: 4000 })
}
</script>

<template>
  <section class="page">
    <div class="section-head">
      <div><h2>并网验收车 · 离线签署与回传合并</h2><p>现场只记实际看过的版本；网络恢复后逐项合并，一处换版整批退回待复核；确认后仅受影响对象失效重算，旧结论与两版冲突均留存。</p></div>
      <Tag :value="sync.online ? '网络在线' : '现场离线'" :severity="sync.online ? 'success' : 'warn'" />
    </div>

    <!-- 车辆操作区 -->
    <div class="vehicle-grid">
      <article>
        <span>① 出车基线</span>
        <p v-if="sync.baseline">已下载 {{ sync.baseline.downloadedAt.replace('T', ' ').slice(0, 16) }}<br />{{ sync.baseline.items.length }} 验收项 / {{ sync.baseline.certificates.length }} 证书 / {{ sync.baseline.defects.length }} 缺陷</p>
        <p v-else>尚未下载，离线签署前必须先取基线</p>
        <Button label="从平台下载基线" size="small" :disabled="!sync.online || sync.busy" @click="download" />
      </article>
      <article>
        <span>② 现场离线签署</span>
        <label>地点<InputText v-model="signSite" /></label>
        <label>签署人<InputText v-model="signer" /></label>
        <Button label="离线签署本批（绑定全部依据版本）" size="small" :disabled="sync.busy" @click="doSign" />
      </article>
      <article>
        <span>③ 网络与故障模拟</span>
        <p>离线期间可在平台侧制造换版；恢复在线后回传。</p>
        <div class="btn-row">
          <Button :label="sync.online ? '切换为离线' : '恢复在线'" size="small" severity="secondary" outlined @click="sync.setOnline(!sync.online)" />
          <Button label="平台侧换版（4类各一处）" size="small" severity="warn" outlined :disabled="sync.busy" @click="drift" />
        </div>
        <Button label="预置下一项写入失败" size="small" severity="danger" outlined @click="sync.armWriteFailure" />
      </article>
      <article>
        <span>④ 断点与去重</span>
        <p>写入失败后从首个未完成项恢复；重复回传命中幂等键，不重复签署。</p>
        <Button label="清空车辆缓存与云端库" size="small" severity="danger" text @click="sync.resetAll" />
      </article>
    </div>
    <p v-if="sync.message" class="sync-message">{{ sync.message }}</p>

    <!-- 签署批次 -->
    <div class="section-head" style="margin-top:18px"><div><h2>签署批次（依据包）</h2><p>缺陷、验收项、证书、多方回复与签署批次绑成一份依据</p></div></div>
    <div v-if="!sync.batches.length" class="empty-hint">暂无离线签署批次。</div>
    <div v-for="batch in sync.batches" :key="batch.id" class="batch-card">
      <div class="batch-head">
        <div>
          <strong>{{ batch.id }}</strong>
          <span>{{ batch.vehicleId }} · {{ batch.site }} · {{ batch.signedAt.replace('T', ' ').slice(0, 16) }} · {{ batch.signer }}</span>
          <small>幂等键 {{ batch.idempotencyKey }} · 依据 {{ batch.refs.length }} 条 · 冲突 {{ batch.conflicts.length }} 处</small>
        </div>
        <div class="btn-row">
          <Tag :value="batch.status" :severity="batchTag[batch.status]" />
          <Button label="查看依据明细" size="small" text @click="openBatch(batch)" />
          <Button v-if="['离线待回传','回传中断','退回待复核'].includes(batch.status)" label="网络恢复·逐项合并" size="small" :disabled="!sync.online || sync.busy" @click="merge(batch)" />
          <Button v-if="batch.status === '回传中断' && !batch.conflicts.some((c) => c.status !== '已重算')" label="从未完成项恢复放行" size="small" severity="warn" :disabled="!sync.online || sync.busy" @click="release(batch)" />
          <Button v-if="batch.status === '重算完成待放行'" label="签署批次放行" size="small" severity="success" :disabled="sync.busy" @click="release(batch)" />
          <Button v-if="batch.status === '已放行'" label="重复放行（幂等）" size="small" severity="secondary" text :disabled="!sync.online || sync.busy" @click="release(batch)" />
        </div>
      </div>
      <div class="line-strip">
        <Tag v-for="line in batch.lines" :key="line.mergeKey" :value="`${line.kind}·${line.objectId} ${line.state}`" :severity="stateTag[line.state]" />
      </div>
      <div v-if="batch.conflicts.length" class="conflict-strip">
        <div v-for="conflict in batch.conflicts" :key="conflict.id" class="conflict-chip" @click="openConflict(conflict)">
          <Tag :value="conflict.status" :severity="conflict.status === '待建设单位确认' ? 'danger' : conflict.status === '已重算' ? 'success' : 'warn'" />
          <b>{{ conflict.kind }} · {{ conflict.objectId }}</b>
          <span>V{{ conflict.fieldEdition }} ⇄ V{{ conflict.cloudEdition }} · {{ conflict.label }}</span>
        </div>
      </div>
    </div>

    <!-- 批次明细 -->
    <Dialog v-model:visible="detailVisible" modal :style="{ width: '900px' }" :header="selectedBatch?.id">
      <div v-if="selectedBatch" class="detail-dialog">
        <h4>逐项合并结果（{{ selectedBatch.lines.length }}）</h4>
        <DataTable :value="selectedBatch.lines" dataKey="mergeKey" size="small" scrollable scrollHeight="260px">
          <Column field="kind" header="类型" style="width:80px" />
          <Column field="objectId" header="对象" style="width:140px" />
          <Column field="label" header="依据" />
          <Column header="现场版本"><template #body="{ data }">V{{ data.fieldEdition }} {{ data.fieldFingerprint.slice(0, 6) }}</template></Column>
          <Column header="云端版本"><template #body="{ data }">{{ data.cloudEdition ? `V${data.cloudEdition} ${(data.cloudFingerprint || '').slice(0, 6)}` : '—' }}</template></Column>
          <Column header="状态"><template #body="{ data }"><Tag :value="data.state" :severity="stateTag[data.state as MergeState]" /></template></Column>
        </DataTable>

        <h4>两版冲突与旧结论（均保留，不覆盖）</h4>
        <div v-if="!selectedBatch.conflicts.length" class="empty-hint">无冲突。</div>
        <div v-for="conflict in selectedBatch.conflicts" :key="conflict.id" class="conflict-row">
          <div class="conflict-row-head"><Tag :value="conflict.kind" /><b>{{ conflict.label }}</b><Tag :value="conflict.status" :severity="conflict.status === '待建设单位确认' ? 'danger' : 'info'" /></div>
          <p class="old-conclusion">旧结论（V{{ conflict.fieldEdition }}，留档）：{{ conflict.oldConclusion }}</p>
          <ul class="diff-list"><li v-for="diff in conflict.diffs" :key="diff">{{ diff }}</li></ul>
          <div class="btn-row">
            <Button v-if="conflict.status === '待建设单位确认'" label="建设单位确认→仅此项失效重算" size="small" severity="warn" @click="openConflict(conflict)" />
            <Button v-else-if="conflict.status === '已确认失效'" label="按新版重算" size="small" @click="openConflict(conflict)" />
            <Tag v-else value="已按新版重算" severity="success" />
          </div>
        </div>

        <h4>留档旧结论</h4>
        <ul class="kept-list"><li v-for="kept in selectedBatch.oldConclusions" :key="kept.refId + kept.fieldEdition">{{ kept.label }}：V{{ kept.fieldEdition }} → V{{ kept.cloudEdition }}，「{{ kept.conclusion }}」（保留{{ kept.kept ? '✓' : '' }}）</li></ul>

        <h4>批次事件</h4>
        <ul class="event-list"><li v-for="event in selectedBatch.events" :key="event.at"><time>{{ event.at.replace('T', ' ').slice(5, 16) }}</time><b>{{ event.type }}</b><span>{{ event.message }}</span></li></ul>
      </div>
    </Dialog>

    <!-- 建设单位确认 / 重算 -->
    <Dialog v-model:visible="conflictVisible" modal :style="{ width: '640px' }" :header="activeConflict ? `${activeConflict.kind} ${activeConflict.objectId} 换版处置` : ''">
      <div v-if="activeConflict" class="conflict-dialog">
        <p class="old-conclusion">现场旧结论（V{{ activeConflict.fieldEdition }}，不予沿用）：{{ activeConflict.oldConclusion }}</p>
        <ul class="diff-list"><li v-for="diff in activeConflict.diffs" :key="diff">{{ diff }}</li></ul>

        <template v-if="activeConflict.status === '待建设单位确认'">
          <label class="block-label">建设单位复核意见<Textarea v-model="opinion" rows="2" placeholder="确认新版依据，仅受影响对象失效重算" /></label>
        </template>

        <template v-else-if="activeConflict.status === '已确认失效'">
          <div v-if="activeConflict.kind === '验收项'" class="edit-grid">
            <label>重算结论<Select v-model="form(activeConflict).status" :options="['合格','不合格','待复验']" /></label>
            <label>实测结果<InputText v-model="form(activeConflict).measured" placeholder="按新版标准重新测量" /></label>
            <label class="span2">重算证据<InputText v-model="form(activeConflict).evidence" placeholder="新版检查记录" /></label>
          </div>
          <div v-else-if="activeConflict.kind === '证书'" class="edit-grid">
            <label>新版核验结论<Select v-model="form(activeConflict).verified" :options="[{label:'核验通过',value:true},{label:'核验不通过',value:false}]" /></label>
          </div>
          <div v-else-if="activeConflict.kind === '缺陷'" class="edit-grid">
            <label class="span2">按新版复验结果<Textarea v-model="form(activeConflict).result" rows="3" placeholder="换版后重新组织联合复验" /></label>
            <label>复验是否通过<Select v-model="form(activeConflict).passed" :options="[{label:'通过',value:true},{label:'不通过',value:false}]" /></label>
            <label>说明<InputText v-model="form(activeConflict).note" /></label>
          </div>
          <div v-else class="edit-grid">
            <label class="span2">按新版重新回复<Textarea v-model="form(activeConflict).content" rows="3" /></label>
            <label class="span2">重算证据<InputText v-model="form(activeConflict).evidence" placeholder="新版回复附件" /></label>
          </div>
        </template>

        <template v-else>
          <p class="empty-hint">该对象已按新版重算完成，等待批次统一放行。旧结论与冲突仍在留档列表中。</p>
        </template>
      </div>
      <template #footer>
        <Button v-if="activeConflict && activeConflict.status === '待建设单位确认'" label="确认：仅受影响对象失效重算" severity="warn" @click="confirm" />
        <Button v-else-if="activeConflict && activeConflict.status === '已确认失效'" label="提交重算结果" @click="doRecompute" />
        <Button v-else label="关闭" text severity="secondary" @click="conflictVisible = false" />
      </template>
    </Dialog>
  </section>
</template>
