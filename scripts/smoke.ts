import { createPinia, setActivePinia } from 'pinia'
import { useAcceptanceStore } from '../stores/acceptance'

setActivePinia(createPinia())
const store = useAcceptanceStore()
const assert = (cond: boolean, msg: string) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } console.log('ok:', msg) }

// 1. 离线签署：绑定缺陷/验收项/证书/多方回复为一份依据，记录现场版本
const created = store.createOfflineBatch('陆川')
const batch = store.batches[0]
assert(created.ok && batch.status === '待回传', '批次已离线签署')
const kinds = new Set(batch.entries.map((e) => e.kind))
assert(['验收项', '缺陷', '证书', '多方回复'].every((k) => kinds.has(k as any)), '四类依据全部绑定')
const itemEntry = batch.entries.find((e) => e.kind === '验收项' && e.entityId === 'IT-T1')!
assert(itemEntry.seenVersion === 1, '现场只记实际看到的版本 V1')

// 2. 写入中断 → 部分回传 → 从未完成项恢复
const interrupted = store.syncBatch(batch.id, { failAfter: 2 })
assert(!interrupted.ok && batch.status === '部分回传', '写入中断，批次部分回传')
const mergedCount = batch.entries.filter((e) => e.status === '已合并').length
assert(mergedCount === 2, '中断前已合并2项')
// 换版：模拟证书/验收项在离线期间换版
store.updateItem('EQ-TR1', 'IT-T1', { measured: '高压对地 13.1GΩ' })
const resumed = store.syncBatch(batch.id)
assert(!resumed.ok && batch.status === '待复核', '有一处变化整批退回待复核')
assert(batch.conflicts.length === 1 && batch.conflicts[0].entityId === 'IT-T1', '冲突留痕：验收项IT-T1')
assert(batch.conflicts[0].seenVersion === 1 && batch.conflicts[0].currentVersion === 2, '两版均保留 V1→V2')
assert(batch.conflicts[0].offlineConclusion.includes('12.8GΩ') && batch.conflicts[0].currentConclusion.includes('13.1GΩ'), '旧结论与线上结论都留下')
const again = store.syncBatch(batch.id)
assert(again.ok && again.message.includes('重复回传'), '重复回传不重复签署')
assert(store.audit.filter((a) => a.action === '合并离线依据').length === mergedCount + batch.entries.length - 3, '审计未重复写入')

// 3. 建设单位确认：仅受影响对象失效重算
const confirmed = store.confirmBatch(batch.id, '建设单位')
assert(confirmed.ok && batch.status === '已确认', '建设单位确认完成')
const item = store.equipment.find((n) => n.id === 'EQ-TR1')!.items.find((i) => i.id === 'IT-T1')!
assert(item.status === '待复验' && item.version === 3, '受影响验收项失效重算为待复验')
const other = store.equipment.find((n) => n.id === 'EQ-GRID')!.items.find((i) => i.id === 'IT-G1')!
assert(other.status === '合格' && other.version === 2, '未受影响对象保持原结论')
assert(batch.conflicts[0].resolved && batch.entries.find((e) => e.entityId === 'IT-T1')!.status === '已失效重算', '冲突标记已失效重算且记录保留')

// 4. 无冲突批次：全部合并后应用离线签署，重复回传不重复签署
const store2Batch = store.createOfflineBatch('陆川')
const b2 = store.batches[0]
// 清掉阻断项以便签署
store.equipment.forEach((n) => n.items.forEach((i) => { if (i.status !== '合格') { i.status = '合格'; i.measured = '复测合格'; i.evidence = '复测记录.pdf'; i.version += 1 } }))
store.defects.forEach((d) => { d.status = '已关闭'; d.version += 1 })
const r1 = store.syncBatch(b2.id)
assert(!r1.ok && b2.status === '待复核', '创建后数据再变化 → 待复核')
const r2 = store.confirmBatch(b2.id, '建设单位')
assert(r2.ok, '第二批复核确认')
console.log('\n全部断言通过')
