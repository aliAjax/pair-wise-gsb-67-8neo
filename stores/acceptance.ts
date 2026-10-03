import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { seedAudit, seedBatches, seedDefects, seedEquipment, seedPlant } from '../data/seed'
import type { AcceptanceDefect, AcceptanceItem, AuditEntry, EquipmentNode, PartyReply, Plant, SignBatch, SignBatchEntry, VersionConflict } from '../types/domain'

const STORAGE_KEY = 'gsb67:grid-acceptance'
let idSeed = 30

export const useAcceptanceStore = defineStore('acceptance', () => {
  const plant = ref<Plant>(structuredClone(seedPlant))
  const equipment = ref<EquipmentNode[]>(structuredClone(seedEquipment))
  const defects = ref<AcceptanceDefect[]>(structuredClone(seedDefects))
  const audit = ref<AuditEntry[]>(structuredClone(seedAudit))
  const batches = ref<SignBatch[]>(structuredClone(seedBatches))
  const selectedEquipmentId = ref(equipment.value[0].id)
  const keyword = ref('')
  const hydrated = ref(false)

  const selectedEquipment = computed(() => equipment.value.find((item) => item.id === selectedEquipmentId.value))
  const stats = computed(() => {
    const items = equipment.value.flatMap((item) => item.items)
    return {
      total: items.length,
      passed: items.filter((item) => item.status === '合格').length,
      failed: items.filter((item) => item.status === '不合格' || item.status === '待复验').length,
      openDefects: defects.value.filter((item) => !['已关闭', '带条件通过'].includes(item.status)).length
    }
  })
  const preflight = computed(() => {
    const blocking: string[] = []
    const items = equipment.value.flatMap((item) => item.items)
    if (items.some((item) => item.status === '待检查')) blocking.push('仍有验收项未检查')
    if (items.some((item) => item.status === '不合格' || item.status === '待复验')) blocking.push('存在不合格或待复验项')
    if (defects.value.some((item) => !['已关闭', '带条件通过'].includes(item.status))) blocking.push('存在未闭环缺陷')
    if (equipment.value.flatMap((item) => item.certificates).some((item) => !item.verified)) blocking.push('存在未核验证书')
    const expired = equipment.value.flatMap((item) => item.certificates).some((item) => item.expiresAt < plant.value.commissioningDate)
    if (expired) blocking.push('证书在并网日期前失效')
    return { allowed: blocking.length === 0, blocking }
  })

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw)
        plant.value = stored.plant
        equipment.value = stored.equipment
        defects.value = stored.defects
        audit.value = stored.audit
        batches.value = stored.batches ?? []
      }
    } catch {
      // Seed data is kept when browser storage is corrupt.
    }
    hydrated.value = true
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ plant: plant.value, equipment: equipment.value, defects: defects.value, audit: audit.value, batches: batches.value }))
  }

  function updateItem(equipmentId: string, itemId: string, patch: Partial<AcceptanceItem>) {
    const item = equipment.value.find((node) => node.id === equipmentId)?.items.find((value) => value.id === itemId)
    if (!item) return
    Object.assign(item, patch, { version: item.version + 1 })
    log(equipmentId, '更新验收项', '当前用户', `${item.id}状态更新为${item.status}`)
    persist()
  }

  function assignDefect(id: string, owner: string) {
    const defect = defects.value.find((item) => item.id === id)
    if (!defect) return
    defect.owner = owner
    defect.status = '整改中'
    defect.version += 1
    log(id, '分派缺陷', '验收负责人', `责任方调整为${owner}`)
    persist()
  }

  function addReply(id: string, reply: PartyReply) {
    const defect = defects.value.find((item) => item.id === id)
    if (!defect || !reply.content || !reply.evidence) return { ok: false, message: '回复内容和证据均不能为空' }
    defect.replies.unshift(reply)
    defect.status = '待联合复验'
    defect.version += 1
    log(id, `${reply.party}提交处理说明`, reply.owner, reply.content)
    persist()
    return { ok: true, message: '已提交处理说明并进入联合复验' }
  }

  function addRetest(id: string, result: string, passed: boolean) {
    const defect = defects.value.find((item) => item.id === id)
    if (!defect) return
    defect.retests.unshift({ round: defect.retests.length + 1, passed, result, tester: '联合验收组', testedAt: new Date().toISOString() })
    defect.status = passed ? '已关闭' : '整改中'
    defect.version += 1
    log(id, '执行联合复验', '联合验收组', result)
    persist()
  }

  function decideDefect(id: string, status: '已关闭' | '带条件通过' | '整改中', note: string) {
    const defect = defects.value.find((item) => item.id === id)
    if (!defect) return { ok: false, message: '缺陷不存在' }
    if (status === '已关闭' && !defect.retests.some((item) => item.passed)) return { ok: false, message: '没有合格复验记录，不能关闭' }
    if (status === '带条件通过' && !note.trim()) return { ok: false, message: '带条件通过必须说明限制条件' }
    defect.status = status
    defect.decisionNote = note
    defect.version += 1
    log(id, `验收决定：${status}`, '验收负责人', note || '完成整改闭环')
    persist()
    return { ok: true, message: `缺陷已更新为${status}` }
  }

  function signOff() {
    if (!preflight.value.allowed) return { ok: false, message: preflight.value.blocking.join('；') }
    plant.value.status = '已签署'
    plant.value.version += 1
    equipment.value.forEach((node) => { node.status = '已验收' })
    log(plant.value.id, '签署交付版本', '验收负责人陆川', `锁定V${plant.value.version}并生成交付包`)
    persist()
    return { ok: true, message: '签署完成，交付版本已锁定' }
  }

  function reset() {
    plant.value = structuredClone(seedPlant)
    equipment.value = structuredClone(seedEquipment)
    defects.value = structuredClone(seedDefects)
    audit.value = structuredClone(seedAudit)
    batches.value = structuredClone(seedBatches)
    persist()
  }

  function currentBasis(entry: Pick<SignBatchEntry, 'kind' | 'entityId' | 'parentId'>): { version: number; conclusion: string } | null {
    if (entry.kind === '验收项') {
      const item = equipment.value.flatMap((node) => node.items).find((value) => value.id === entry.entityId)
      return item ? { version: item.version, conclusion: `状态${item.status}，实测${item.measured || '未录入'}` } : null
    }
    if (entry.kind === '缺陷') {
      const defect = defects.value.find((value) => value.id === entry.entityId)
      return defect ? { version: defect.version, conclusion: `状态${defect.status}，${defect.decisionNote || '暂无验收决定'}` } : null
    }
    if (entry.kind === '证书') {
      const certificate = equipment.value.flatMap((node) => node.certificates).find((value) => value.id === entry.entityId)
      return certificate ? { version: certificate.version, conclusion: `${certificate.verified ? '已核验' : '未核验'}，有效期至${certificate.expiresAt}` } : null
    }
    const defect = defects.value.find((value) => value.id === entry.parentId)
    const reply = defect?.replies.find((value) => `${entry.parentId}:${value.repliedAt}` === entry.entityId)
    if (!defect || !reply) return null
    return { version: defect.version, conclusion: `${reply.party}${reply.owner}：${reply.content}` }
  }

  function createOfflineBatch(operator: string) {
    const id = `SB-${Date.now().toString(36).toUpperCase()}-${idSeed++}`
    const entries: SignBatchEntry[] = []
    equipment.value.forEach((node) => {
      node.items.forEach((item) => entries.push({ key: `${id}:验收项:${item.id}`, kind: '验收项', entityId: item.id, parentId: node.id, seenVersion: item.version, conclusion: currentBasis({ kind: '验收项', entityId: item.id, parentId: node.id })!.conclusion, status: '待回传', mergedAt: null }))
      node.certificates.forEach((certificate) => entries.push({ key: `${id}:证书:${certificate.id}`, kind: '证书', entityId: certificate.id, parentId: node.id, seenVersion: certificate.version, conclusion: currentBasis({ kind: '证书', entityId: certificate.id, parentId: node.id })!.conclusion, status: '待回传', mergedAt: null }))
    })
    defects.value.forEach((defect) => {
      entries.push({ key: `${id}:缺陷:${defect.id}`, kind: '缺陷', entityId: defect.id, parentId: null, seenVersion: defect.version, conclusion: currentBasis({ kind: '缺陷', entityId: defect.id, parentId: null })!.conclusion, status: '待回传', mergedAt: null })
      defect.replies.forEach((reply) => entries.push({ key: `${id}:多方回复:${defect.id}:${reply.repliedAt}`, kind: '多方回复', entityId: `${defect.id}:${reply.repliedAt}`, parentId: defect.id, seenVersion: defect.version, conclusion: currentBasis({ kind: '多方回复', entityId: `${defect.id}:${reply.repliedAt}`, parentId: defect.id })!.conclusion, status: '待回传', mergedAt: null }))
    })
    batches.value.unshift({ id, plantId: plant.value.id, createdBy: operator, createdAt: new Date().toISOString(), status: '待回传', entries, conflicts: [], confirmedBy: null, confirmedAt: null })
    log(id, '离线签署批次', operator, `现场离线签署${entries.length}项依据，仅记录实际看到的版本`)
    persist()
    return { ok: true, message: `批次${id}已离线签署，绑定${entries.length}项依据` }
  }

  function syncBatch(id: string, options: { failAfter?: number } = {}) {
    const batch = batches.value.find((item) => item.id === id)
    if (!batch) return { ok: false, message: '批次不存在' }
    if (batch.status === '已确认') return { ok: false, message: '批次已由建设单位确认，无需回传' }
    const pending = batch.entries.filter((entry) => entry.status === '待回传')
    if (!pending.length) return { ok: true, message: '没有待回传项，重复回传不会重复签署' }
    let processed = 0
    for (const entry of pending) {
      if (options.failAfter !== undefined && processed >= options.failAfter) {
        batch.status = '部分回传'
        log(id, '回传写入中断', '验收车网关', `已合并${processed}项，剩余${pending.length - processed}项待恢复`)
        persist()
        return { ok: false, message: `写入中断：已合并${processed}项，可从${pending.length - processed}个未完成项恢复` }
      }
      const basis = currentBasis(entry)
      if (basis && basis.version === entry.seenVersion) {
        entry.status = '已合并'
        entry.mergedAt = new Date().toISOString()
        log(id, '合并离线依据', '验收车网关', `${entry.kind}${entry.entityId}版本V${entry.seenVersion}一致，离线结论生效`)
      } else {
        entry.status = '冲突'
        batch.conflicts.push({ id: `CF-${Date.now()}-${idSeed++}`, batchId: id, kind: entry.kind, entityId: entry.entityId, seenVersion: entry.seenVersion, currentVersion: basis?.version ?? -1, offlineConclusion: entry.conclusion, currentConclusion: basis?.conclusion ?? '对象已不存在', detectedAt: new Date().toISOString(), resolved: false })
        log(id, '检出版本冲突', '验收车网关', `${entry.kind}${entry.entityId}现场V${entry.seenVersion}与线上V${basis?.version ?? '-'}不一致，整批退回待复核`)
      }
      processed += 1
    }
    if (batch.conflicts.some((item) => !item.resolved)) {
      batch.status = '待复核'
      persist()
      return { ok: false, message: '存在版本变化，批次已退回待复核，不能沿用旧结论放行' }
    }
    batch.status = '已合并'
    if (plant.value.status !== '已签署' && preflight.value.allowed) {
      plant.value.status = '已签署'
      plant.value.version += 1
      equipment.value.forEach((node) => { node.status = '已验收' })
      log(plant.value.id, '应用离线签署', batch.createdBy, `批次${id}全部合并，锁定V${plant.value.version}`)
    }
    log(id, '批次合并完成', '验收车网关', `${batch.entries.length}项依据全部合并`)
    persist()
    return { ok: true, message: `批次${id}已合并，离线签署结论生效` }
  }

  function confirmBatch(id: string, operator: string) {
    const batch = batches.value.find((item) => item.id === id)
    if (!batch) return { ok: false, message: '批次不存在' }
    if (batch.status !== '待复核') return { ok: false, message: '仅待复核批次可由建设单位确认' }
    const affected: string[] = []
    batch.entries.filter((entry) => entry.status === '冲突').forEach((entry) => {
      if (entry.kind === '验收项') {
        const item = equipment.value.flatMap((node) => node.items).find((value) => value.id === entry.entityId)
        if (item) { item.status = '待复验'; item.version += 1 }
      } else if (entry.kind === '缺陷' || entry.kind === '多方回复') {
        const defect = defects.value.find((value) => value.id === (entry.kind === '缺陷' ? entry.entityId : entry.parentId))
        if (defect && ['已关闭', '带条件通过'].includes(defect.status)) { defect.status = '待联合复验'; defect.version += 1 }
        else if (defect) { defect.version += 1 }
      } else {
        const certificate = equipment.value.flatMap((node) => node.certificates).find((value) => value.id === entry.entityId)
        if (certificate) { certificate.verified = false; certificate.version += 1 }
      }
      entry.status = '已失效重算'
      affected.push(`${entry.kind}${entry.entityId}`)
    })
    batch.conflicts.forEach((conflict) => { conflict.resolved = true })
    batch.status = '已确认'
    batch.confirmedBy = operator
    batch.confirmedAt = new Date().toISOString()
    if (plant.value.status === '已签署') {
      plant.value.status = '待复核'
      plant.value.version += 1
    }
    log(id, '建设单位确认冲突', operator, `仅失效重算${affected.length}个受影响对象：${affected.join('、')}；旧结论与两版冲突保留`)
    persist()
    return { ok: true, message: `已确认，${affected.length}个受影响对象失效重算，冲突记录保留` }
  }

  function log(entityId: string, action: string, operator: string, detail: string) {
    audit.value.unshift({ id: `AUD-${Date.now()}-${idSeed++}`, entityId, action, operator, detail, createdAt: new Date().toISOString() })
  }

  return { plant, equipment, defects, audit, batches, selectedEquipmentId, keyword, hydrated, selectedEquipment, stats, preflight, hydrate, updateItem, assignDefect, addReply, addRetest, decideDefect, signOff, createOfflineBatch, syncBatch, confirmBatch, reset }
})
