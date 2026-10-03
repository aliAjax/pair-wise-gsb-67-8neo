import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAcceptanceStore } from './acceptance'
import { useCloudService } from '../services/cloud'
import {
  certificateConclusion,
  certificateEdition,
  defectConclusion,
  defectEdition,
  diffEditions,
  fingerprint,
  itemConclusion,
  itemEdition,
  replyConclusion,
  replyEdition,
  replyKey
} from '../services/edition'
import type {
  BasisKind,
  BasisRef,
  BatchEvent,
  MergeLine,
  OldConclusion,
  SigningBatch,
  VehicleBaseline,
  VersionConflict
} from '../types/sync'
import type { AcceptanceItem } from '../types/domain'

const SYNC_KEY = 'gsb67:vehicle-sync'
let batchSeq = 0

interface PersistedSync {
  baseline: VehicleBaseline | null
  batches: SigningBatch[]
}

export const useSyncStore = defineStore('sync', () => {
  const acceptance = useAcceptanceStore()
  const cloud = useCloudService()

  const baseline = ref<VehicleBaseline | null>(null)
  const batches = ref<SigningBatch[]>([])
  const online = ref(true)
  const busy = ref(false)
  const message = ref('')
  const hydrated = ref(false)

  const pendingBatches = computed(() => batches.value.filter((batch) => batch.status !== '已放行'))
  const unresolvedConflictCount = computed(() => batches.value.reduce(
    (sum, batch) => sum + batch.conflicts.filter((conflict) => conflict.status === '待建设单位确认').length, 0
  ))

  function persist() {
    if (!import.meta.client) return
    const payload: PersistedSync = { baseline: baseline.value, batches: batches.value }
    localStorage.setItem(SYNC_KEY, JSON.stringify(payload))
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    const net = cloud.loadNetwork()
    online.value = net.online
    try {
      const raw = localStorage.getItem(SYNC_KEY)
      if (raw) {
        const stored: PersistedSync = JSON.parse(raw)
        baseline.value = stored.baseline
        batches.value = stored.batches
      }
    } catch {
      // 车辆本地缓存损坏时保持空基线，由现场重新下载
    }
    hydrated.value = true
  }

  function resetAll() {
    baseline.value = null
    batches.value = []
    cloud.reset()
    cloud.saveNetwork({ online: false, failNextWrite: false })
    online.value = false
    if (import.meta.client) localStorage.removeItem(SYNC_KEY)
    acceptance.reset()
  }

  function setOnline(value: boolean) {
    online.value = value
    cloud.saveNetwork({ ...cloud.loadNetwork(), online: value })
  }
  function armWriteFailure() {
    cloud.saveNetwork({ ...cloud.loadNetwork(), failNextWrite: true })
    message.value = '已设置：下一项平台写入将失败，用于验证从断点恢复'
  }

  /** 模拟现场离线期间平台侧发生换版（仅作用于云端权威库，车辆缓存不变） */
  function applyCloudDrift() {
    const notes = cloud.applyDrift()
    message.value = notes.length ? `平台已发生${notes.length}处换版（车辆基线未更新）` : '平台已无新版本可换'
    return notes
  }

  function logEvent(batch: SigningBatch, type: string, text: string) {
    const event: BatchEvent = { at: new Date().toISOString(), type, message: text }
    batch.events.unshift(event)
    acceptance.audit.unshift({ id: `SYNC-${Date.now()}-${batchSeq++}`, entityId: batch.id, action: type, operator: '验收车', detail: text, createdAt: event.at })
  }

  /** 出车前/入场时下载基线：现场只记录实际看过的版本 */
  async function downloadBaseline() {
    busy.value = true
    message.value = '正在从电站平台拉取验收基线…'
    try {
      const state = await cloud.fetchState()
      baseline.value = {
        downloadedAt: new Date().toISOString(),
        items: Object.values(state.items),
        certificates: Object.values(state.certificates),
        defects: Object.values(state.defects),
        replies: Object.values(state.replies)
      }
      persist()
      message.value = `基线已下载（${baseline.value.items.length}验收项/${baseline.value.certificates.length}证书/${baseline.value.defects.length}缺陷），离线签署将绑定这些版本`
    } catch (error) {
      message.value = error instanceof Error ? error.message : '基线下载失败'
    } finally {
      busy.value = false
    }
  }

  /**
   * 离线签署：把缺陷、验收项、证书、多方回复与本签署批次绑成一份依据。
   * 每条依据冻结现场实际看过的版本号与指纹，不读取云端。
   */
  function signOfflineBatch(signer: string, site: string): { ok: boolean; message: string } {
    if (!baseline.value) return { ok: false, message: '车辆尚未下载基线，不能离线签署' }
    const id = `SIGN-OFFLINE-${new Date().toISOString().slice(0, 9).replaceAll('-', '')}-${String(batches.value.length + 1).padStart(2, '0')}`
    const refs: BasisRef[] = []

    acceptance.equipment.forEach((node) => {
      node.items.forEach((item) => {
        const edition = itemEdition(item)
        refs.push({
          kind: '验收项', objectId: item.id, equipmentId: node.id, label: `${node.name} / ${item.standard}`,
          editionVersion: edition.editionVersion, editionFingerprint: fingerprint(edition), snapshot: edition, conclusion: itemConclusion(item)
        })
      })
      node.certificates.forEach((certificate) => {
        const edition = certificateEdition(certificate)
        refs.push({
          kind: '证书', objectId: certificate.id, equipmentId: node.id, label: `${node.name} / ${certificate.name}`,
          editionVersion: edition.editionVersion, editionFingerprint: fingerprint(edition), snapshot: edition, conclusion: certificateConclusion(certificate)
        })
      })
    })
    acceptance.defects.forEach((defect) => {
      const edition = defectEdition(defect)
      refs.push({
        kind: '缺陷', objectId: defect.id, defectId: defect.id, label: defect.title,
        editionVersion: edition.editionVersion, editionFingerprint: fingerprint(edition), snapshot: edition, conclusion: defectConclusion(defect)
      })
      defect.replies.forEach((reply) => {
        const keyed = { ...reply, replyKey: (reply as { replyKey?: string }).replyKey ?? replyKey(reply) }
        const replySnap = replyEdition(keyed)
        refs.push({
          kind: '多方回复', objectId: keyed.replyKey, defectId: defect.id, label: `${defect.title} / ${keyed.party}·${keyed.owner}回复`,
          editionVersion: replySnap.editionVersion, editionFingerprint: fingerprint(replySnap), snapshot: replySnap, conclusion: replyConclusion(keyed)
        })
      })
    })

    const lines: MergeLine[] = refs.map((ref) => ({
      refId: ref.objectId,
      kind: ref.kind,
      objectId: ref.objectId,
      equipmentId: ref.equipmentId,
      defectId: ref.defectId,
      label: ref.label,
      fieldEdition: ref.editionVersion,
      fieldFingerprint: ref.editionFingerprint,
      state: '未回传',
      mergeKey: `${id}:${ref.kind}:${ref.objectId}`
    }))

    const batch: SigningBatch = {
      id,
      vehicleId: '验收车-01',
      site,
      signedAt: new Date().toISOString(),
      signer,
      status: '离线待回传',
      refs,
      lines,
      conflicts: [],
      oldConclusions: [],
      events: [],
      idempotencyKey: `IDEM-${id}`
    }
    logEvent(batch, '离线签署', `${signer}在${site}离线签署，绑定${refs.length}条依据（验收项/证书/缺陷/多方回复），版本与指纹已随批冻结`)
    batches.value.unshift(batch)
    persist()
    return { ok: true, message: `${id} 已离线签署，${refs.length}条依据待网络恢复后逐项合并` }
  }

  /**
   * 网络恢复后逐项合并。任何一处版本变化：
   * - 该批立即退回“待复核”，不沿用旧结论放行；
   * - 冲突项不再写入云端，旧结论与两版差异全部留下；
   * - 一致项继续逐项写入；写入失败则中断，已完成项保留，恢复时从未完成项继续。
   */
  async function mergeBatch(batchId: string) {
    const batch = batches.value.find((item) => item.id === batchId)
    if (!batch || busy.value) return
    if (!online.value) { message.value = '仍处离线，无法回传合并'; return }
    busy.value = true
    batch.status = '回传中'
    logEvent(batch, '开始回传', '网络恢复，开始逐项合并离线结果')
    let cloudState
    try {
      cloudState = await cloud.fetchState()
    } catch (error) {
      batch.status = '回传中断'
      logEvent(batch, '回传中断', error instanceof Error ? error.message : '无法获取云端版本')
      busy.value = false
      persist()
      return
    }

    let conflictFound = batch.conflicts.some((item) => item.status === '待建设单位确认')
    let failedAt: MergeLine | null = null

    for (const line of batch.lines) {
      if (line.state === '合并一致' || line.state === '已放行') continue // 重复回传/恢复时跳过已完成项
      line.state = '待写入'
      line.failReason = undefined

      // 与云端当前版本逐项比对
      const cloudSnap = lookupCloudEdition(line.kind, line.objectId, cloudState)
      line.cloudEdition = cloudSnap?.editionVersion
      line.cloudFingerprint = cloudSnap ? fingerprint(cloudSnap) : undefined
      line.cloudSnapshot = cloudSnap ?? undefined
      const conflict = !cloudSnap || cloudSnap.editionVersion !== line.fieldEdition || line.cloudFingerprint !== line.fieldFingerprint
      if (conflict) {
        conflictFound = true
        line.state = '版本冲突'
        line.diffs = cloudSnap ? diffEditions(batch.refs.find((ref) => ref.objectId === line.objectId && ref.kind === line.kind)!.snapshot, cloudSnap) : ['云端对象不存在（已删除或撤版）']
        registerConflict(batch, line, cloudSnap)
        persist()
        continue
      }

      // 版本一致才写入离线结论
      try {
        const result = await cloud.writeMergedRef(line.mergeKey, buildWritePatch(line.kind, line.objectId, acceptance))
        if (result.duplicate) {
          line.state = '合并一致'
          line.appliedAt = new Date().toISOString()
          logEvent(batch, '重复回传去重', `${line.label} 已合并过，本次跳过，不重复签署`)
        } else {
          line.state = '合并一致'
          line.appliedAt = new Date().toISOString()
        }
        persist()
      } catch (error) {
        line.state = '写入失败'
        line.failReason = error instanceof Error ? error.message : '写入失败'
        failedAt = line
        persist()
        break // 从未完成项恢复：保留此前完成项
      }
    }

    if (failedAt) {
      batch.status = '回传中断'
      logEvent(batch, '写入失败中断', `「${failedAt.label}」写入失败：${failedAt.failReason}。已完成项保留，可从该未完成项恢复`)
    } else if (conflictFound) {
      batch.status = '退回待复核'
      logEvent(batch, '整批退回待复核', `检测到${batch.conflicts.filter((item) => item.status === '待建设单位确认').length}处版本变化，禁止沿用旧结论放行；一致项已合并，冲突待建设单位确认`)
    } else {
      batch.status = '重算完成待放行' // 全部一致，等价于无需重算，等待放行
      batch.uploadedAt = new Date().toISOString()
      logEvent(batch, '逐项合并完成', `${batch.lines.length}条依据版本全部一致并合并，等待签署批次放行`)
    }
    message.value = failedAt ? `回传中断于「${failedAt.label}」，完成项已保留` : conflictFound ? '批次已退回待复核' : '合并完成，可放行'
    busy.value = false
    persist()
  }

  function registerConflict(batch: SigningBatch, line: MergeLine, cloudSnapshot: ReturnType<typeof lookupCloudEdition>) {
    const ref = batch.refs.find((value) => value.objectId === line.objectId && value.kind === line.kind)!
    if (batch.conflicts.some((value) => value.refId === line.objectId && value.kind === line.kind && value.status !== '已重算')) return
    const conflict: VersionConflict = {
      id: `CFL-${batch.id}-${line.kind}-${line.objectId}`.slice(0, 60),
      batchId: batch.id,
      refId: line.objectId,
      kind: line.kind,
      objectId: line.objectId,
      defectId: line.defectId,
      label: line.label,
      fieldEdition: line.fieldEdition,
      cloudEdition: line.cloudEdition ?? 0,
      fieldSnapshot: ref.snapshot,
      cloudSnapshot: cloudSnapshot ?? { editionVersion: 0, fields: {} },
      diffs: line.diffs ?? [],
      oldConclusion: ref.conclusion,
      status: '待建设单位确认',
      createdAt: new Date().toISOString()
    }
    batch.conflicts.unshift(conflict)
    batch.oldConclusions.unshift({
      refId: line.objectId,
      label: line.label,
      fieldEdition: line.fieldEdition,
      cloudEdition: line.cloudEdition ?? 0,
      conclusion: ref.conclusion,
      kept: true
    })
  }

  /**
   * 建设单位确认：只让受影响对象失效重算；非冲突对象沿用已合并结论。
   * 旧结论与两版冲突记录继续保留。
   */
  function confirmConflict(batchId: string, conflictId: string, opinion: string) {
    const batch = batches.value.find((item) => item.id === batchId)
    const conflict = batch?.conflicts.find((item) => item.id === conflictId)
    if (!batch || !conflict || conflict.status !== '待建设单位确认') return
    conflict.status = '已确认失效'
    conflict.confirmedAt = new Date().toISOString()

    const line = batch.lines.find((item) => item.objectId === conflict.objectId && item.kind === conflict.kind)
    if (line) line.state = '已失效待重算'

    if (conflict.kind === '验收项') {
      acceptance.invalidateItem(line?.equipmentId ?? '', conflict.objectId, {
        standard: String(conflict.cloudSnapshot.fields.standard ?? ''),
        method: String(conflict.cloudSnapshot.fields.method ?? ''),
        condition: String(conflict.cloudSnapshot.fields.condition ?? ''),
        version: conflict.cloudEdition
      })
    } else if (conflict.kind === '证书') {
      const cert = acceptance.equipment.flatMap((node) => node.certificates).find((value) => value.id === conflict.objectId)
      acceptance.invalidateCertificate(conflict.objectId, {
        name: String(conflict.cloudSnapshot.fields.name ?? cert?.name ?? ''),
        issuer: String(conflict.cloudSnapshot.fields.issuer ?? ''),
        expiresAt: String(conflict.cloudSnapshot.fields.expiresAt ?? ''),
        version: conflict.cloudEdition
      })
    } else if (conflict.kind === '缺陷') {
      acceptance.invalidateDefect(conflict.objectId, {
        title: String(conflict.cloudSnapshot.fields.title ?? ''),
        severity: conflict.cloudSnapshot.fields.severity === '重大' ? '重大' : '一般',
        owner: String(conflict.cloudSnapshot.fields.owner ?? ''),
        dueDate: String(conflict.cloudSnapshot.fields.dueDate ?? ''),
        version: conflict.cloudEdition
      })
    } else if (conflict.kind === '多方回复') {
      acceptance.invalidateReply(conflict.defectId ?? '', conflict.objectId)
    }

    batch.status = '待重算'
    logEvent(batch, '建设单位确认失效', `「${conflict.label}」V${conflict.fieldEdition}→V${conflict.cloudEdition} 仅受影响对象失效重算；意见：${opinion || '现场复核新版'}。旧结论与两版冲突均保留`)
    persist()
  }

  /** 受影响验收项按新版重新检查（重算） */
  function recomputeItem(batchId: string, conflictId: string, patch: { status: AcceptanceItem['status']; measured: string; evidence: string }) {
    const batch = batches.value.find((item) => item.id === batchId)
    const conflict = batch?.conflicts.find((item) => item.id === conflictId)
    if (!batch || !conflict) return
    const equipmentId = batch.lines.find((item) => item.objectId === conflict.objectId && item.kind === '验收项')?.equipmentId ?? ''
    acceptance.reinspectItem(equipmentId, conflict.objectId, patch)
    finishRecompute(batch, conflict, `按云端V${conflict.cloudEdition}重新检查：${patch.status} ${patch.measured}`)
  }

  /** 受影响证书重新核验（重算） */
  function recomputeCertificate(batchId: string, conflictId: string, verified: boolean) {
    const batch = batches.value.find((item) => item.id === batchId)
    const conflict = batch?.conflicts.find((item) => item.id === conflictId)
    if (!batch || !conflict) return
    acceptance.reverifyCertificate(conflict.objectId, verified)
    finishRecompute(batch, conflict, `按云端V${conflict.cloudEdition}重新核验：${verified ? '通过' : '不通过'}`)
  }

  /** 受影响缺陷按新版重新复验（重算） */
  function recomputeDefect(batchId: string, conflictId: string, result: string, passed: boolean, note: string) {
    const batch = batches.value.find((item) => item.id === batchId)
    const conflict = batch?.conflicts.find((item) => item.id === conflictId)
    if (!batch || !conflict) return
    acceptance.retestDefect(conflict.objectId, result, passed, note)
    finishRecompute(batch, conflict, `按云端V${conflict.cloudEdition}重新复验：${passed ? '通过关闭' : '未通过继续整改'}`)
  }

  /** 受影响多方回复按新版重新回复（重算） */
  function recomputeReplyConflict(batchId: string, conflictId: string, content: string, evidence: string) {
    const batch = batches.value.find((item) => item.id === batchId)
    const conflict = batch?.conflicts.find((item) => item.id === conflictId)
    if (!batch || !conflict || !conflict.defectId) return
    const newKey = acceptance.recomputeReply(conflict.defectId, conflict.objectId, content, evidence)
    const line = batch.lines.find((item) => item.objectId === conflict.objectId && item.kind === '多方回复')
    if (line && newKey) {
      line.objectId = newKey // 重算回复产生新版本身份，放行时按新键写回
      conflict.objectId = newKey
    }
    finishRecompute(batch, conflict, '按云端新版重新提交多方回复')
  }

  function finishRecompute(batch: SigningBatch, conflict: VersionConflict, summary: string) {
    conflict.status = '已重算'
    conflict.recalculatedAt = new Date().toISOString()
    const line = batch.lines.find((item) =>
      item.kind === conflict.kind &&
      (item.objectId === conflict.objectId || item.objectId === conflict.refId || item.refId === conflict.refId))
    if (line) {
      line.state = '重算完成待放行'
      if (conflict.kind === '多方回复') line.objectId = conflict.objectId // 重算回复可能换用新身份键
    }
    const kept = batch.oldConclusions.find((item) => item.refId === conflict.refId && item.fieldEdition === conflict.fieldEdition)
    if (kept) kept.kept = true
    logEvent(batch, '受影响对象重算完成', `「${conflict.label}」${summary}；旧结论留存备查`)
    if (batch.conflicts.every((item) => item.status === '已重算')) {
      batch.status = '重算完成待放行'
      logEvent(batch, '重算全部完成', '所有受影响对象已按新版重算，未受影响对象沿用已合并结论，可以放行批次')
    }
    persist()
  }

  /**
   * 批次放行：把重算结论按新版本写回云端（重算对象是新指纹，不与旧合并键冲突），
   * 再以批次幂等键签署。重复放行命中云端记录，不重复签署。
   */
  async function releaseBatch(batchId: string) {
    const batch = batches.value.find((item) => item.id === batchId)
    if (!batch || busy.value) return { ok: false, message: '批次不可放行' }
    // 已放行批次的重复请求：以幂等键向平台确认，不重复签署
    if (batch.status === '已放行') {
      if (!online.value) return { ok: true, message: '批次此前已放行（离线，沿用本地签署记录）' }
      try {
        const dup = await cloud.releaseBatch(batch.id, batch.idempotencyKey)
        return { ok: true, message: dup.duplicate ? '该批次此前已放行，未重复签署' : '批次已签署放行' }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '放行确认失败' }
      }
    }
    // 放行条件：冲突全部重算完成；允许“放行写回中断”后从未完成项恢复
    const conflictResolved = batch.conflicts.length > 0 ? batch.conflicts.every((item) => item.status === '已重算') : true
    const interruptedWriteback = batch.status === '回传中断' && batch.lines.some((line) => line.state === '写入失败')
    if (batch.status !== '重算完成待放行' && !(conflictResolved && interruptedWriteback)) {
      return { ok: false, message: '仍有版本冲突未确认或受影响对象未重算完成，不能放行' }
    }
    if (!online.value) return { ok: false, message: '离线状态不能放行' }
    busy.value = true
    try {
      // 重算项按新版本写回（键名含 :RE: 与首轮合并区分，重复回传仍幂等）
      // 恢复时“已放行”跳过，“写入失败/待放行”项重写——从未完成项继续，已完成不重复
      for (const line of batch.lines.filter((item) => item.state === '重算完成待放行' || item.state === '写入失败')) {
        const patch = buildWritePatch(line.kind, line.objectId, acceptance)
        try {
          await cloud.writeMergedRef(`${batch.id}:RE:${line.objectId}`, patch)
          line.state = '已放行'
          delete line.failReason
          persist()
        } catch (error) {
          line.state = '写入失败'
          line.failReason = error instanceof Error ? error.message : '写回失败'
          batch.status = '回传中断'
          logEvent(batch, '放行写回中断', `「${line.label}」重算结论写回失败，已写回项保留，可从该未完成项恢复`)
          busy.value = false
          persist()
          return { ok: false, message: `写回失败：${line.failReason}，完成项已保留，可恢复放行` }
        }
      }
      const result = await cloud.releaseBatch(batch.id, batch.idempotencyKey)
      batch.releasedAt = result.releasedAt
      batch.status = '已放行'
      batch.lines.forEach((line) => { if (line.state === '合并一致' || line.state === '重算完成待放行') line.state = '已放行' })
      logEvent(batch, result.duplicate ? '重复放行去重' : '签署批次放行',
        result.duplicate ? '平台已有该批次签署记录，本次不重复签署' : '受影响对象已按新版重算并写回，整批签署放行；旧结论与冲突记录归档留存')
      persist()
      return { ok: true, message: result.duplicate ? '该批次此前已放行，未重复签署' : '批次已签署放行' }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : '放行失败' }
    } finally {
      busy.value = false
    }
  }

  return {
    baseline, batches, online, busy, message, hydrated, pendingBatches, unresolvedConflictCount,
    hydrate, persist, resetAll, setOnline, armWriteFailure, applyCloudDrift, downloadBaseline, signOfflineBatch,
    mergeBatch, confirmConflict, recomputeItem, recomputeCertificate, recomputeDefect, recomputeReplyConflict, releaseBatch
  }
})

// ---- 合并辅助 ----

function lookupCloudEdition(kind: BasisKind, objectId: string, cloud: Awaited<ReturnType<ReturnType<typeof useCloudService>['fetchState']>>) {
  if (kind === '验收项') { const hit = cloud.items[objectId]; return hit ? itemEdition(hit.item) : null }
  if (kind === '证书') { const hit = cloud.certificates[objectId]; return hit ? certificateEdition(hit.certificate) : null }
  if (kind === '缺陷') { const hit = cloud.defects[objectId]; return hit ? defectEdition(hit) : null }
  const hit = cloud.replies[objectId]
  return hit ? replyEdition(hit.reply) : null
}

function buildWritePatch(kind: BasisKind, objectId: string, acceptance: ReturnType<typeof useAcceptanceStore>) {
  if (kind === '验收项') {
    const node = acceptance.equipment.find((value) => value.items.some((item) => item.id === objectId))
    const item = node?.items.find((value) => value.id === objectId)
    return item && node ? { item: { equipmentId: node.id, item: structuredClone(item) } } : undefined
  }
  if (kind === '证书') {
    const node = acceptance.equipment.find((value) => value.certificates.some((item) => item.id === objectId))
    const certificate = node?.certificates.find((value) => value.id === objectId)
    return certificate && node ? { certificate: { equipmentId: node.id, certificate: structuredClone(certificate) } } : undefined
  }
  if (kind === '缺陷') {
    const defect = acceptance.defects.find((value) => value.id === objectId)
    return defect ? { defect: structuredClone(defect) } : undefined
  }
  const defect = acceptance.defects.find((value) => value.replies.some((reply) => ((reply as { replyKey?: string }).replyKey ?? replyKey(reply)) === objectId))
  const reply = defect?.replies.find((value) => ((value as { replyKey?: string }).replyKey ?? replyKey(value)) === objectId)
  return defect && reply ? { reply: { defectId: defect.id, reply: { ...structuredClone(reply), replyKey: objectId } } } : undefined
}
