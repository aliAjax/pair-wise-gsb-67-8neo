import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { seedAudit, seedDefects, seedEquipment, seedPlant } from '../data/seed'
import { replyKey } from '../services/edition'
import type { AcceptanceDefect, AcceptanceItem, AuditEntry, Certificate, EquipmentNode, PartyReply, Plant } from '../types/domain'

const STORAGE_KEY = 'gsb67:grid-acceptance'
let idSeed = 30

type ItemEditionFields = Pick<AcceptanceItem, 'standard' | 'method' | 'condition'>
type DefectEditionFields = Pick<AcceptanceDefect, 'title' | 'severity' | 'owner' | 'dueDate'>

export const useAcceptanceStore = defineStore('acceptance', () => {
  const plant = ref<Plant>(structuredClone(seedPlant))
  const equipment = ref<EquipmentNode[]>(structuredClone(seedEquipment))
  const defects = ref<AcceptanceDefect[]>(structuredClone(seedDefects))
  const audit = ref<AuditEntry[]>(structuredClone(seedAudit))
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
      }
    } catch {
      // Seed data is kept when browser storage is corrupt.
    }
    hydrated.value = true
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ plant: plant.value, equipment: equipment.value, defects: defects.value, audit: audit.value }))
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

  /** 建设单位确认换版后：仅让受影响验收项失效，本地切到新版并退回待检查重算 */
  function invalidateItem(equipmentId: string, itemId: string, edition: ItemEditionFields & { version: number }) {
    const node = equipment.value.find((value) => value.id === equipmentId)
    const item = node?.items.find((value) => value.id === itemId)
    if (!item) return
    Object.assign(item, edition, { status: '待检查' as const, measured: '', evidence: '' })
    if (node) node.status = '验收中'
    log(itemId, '换版失效重算', '建设单位', `验收项采用云端V${edition.version}，原现场结论作废，需重新检查`)
    persist()
  }

  /** 受影响证书失效：切到新版并回到待核验，不沿用旧核验结论 */
  function invalidateCertificate(certificateId: string, edition: Pick<Certificate, 'name' | 'issuer' | 'expiresAt' | 'version'>) {
    const certificate = equipment.value.flatMap((node) => node.certificates).find((value) => value.id === certificateId)
    if (!certificate) return
    Object.assign(certificate, edition, { verified: false })
    log(certificateId, '换版失效重算', '建设单位', `证书采用云端V${edition.version}，需重新核验`)
    persist()
  }

  /** 受影响缺陷失效：采用新版缺陷描述，回到整改/待分派重算 */
  function invalidateDefect(defectId: string, edition: DefectEditionFields & { version: number }) {
    const defect = defects.value.find((value) => value.id === defectId)
    if (!defect) return
    Object.assign(defect, edition, { status: '整改中' as const, decisionNote: '' })
    log(defectId, '换版失效重算', '建设单位', `缺陷采用云端V${edition.version}，原处置结论作废，需重新闭环`)
    persist()
  }

  /** 受影响的多方回复：标记失效，需要责任方按新版重新回复 */
  function invalidateReply(defectId: string, replyKeyToken: string) {
    const defect = defects.value.find((value) => value.id === defectId)
    const target = defect?.replies.find((reply) => (reply as PartyReply & { replyKey?: string }).replyKey === replyKeyToken || replyKey(reply) === replyKeyToken)
    if (!defect || !target) return
    ;(target as PartyReply & { replyKey?: string }).replyKey = replyKeyToken
    target.content = `【旧版回复已失效·待按新版重回复】${target.content}`
    defect.status = '整改中'
    defect.version += 1
    log(defectId, '回复换版失效', '建设单位', `${target.party} ${target.owner} 的回复依据已换版，需重新提交`)
    persist()
  }

  /** 受影响验收项按新版重算：现场重新检查后录入新结论 */
  function reinspectItem(equipmentId: string, itemId: string, patch: Pick<AcceptanceItem, 'status' | 'measured' | 'evidence'>) {
    const item = equipment.value.find((node) => node.id === equipmentId)?.items.find((value) => value.id === itemId)
    if (!item) return
    Object.assign(item, patch, { version: item.version + 1 })
    log(itemId, '按新版重算', '现场验收组', `基于V${item.version}重新检查：${item.status} ${item.measured}`)
    persist()
  }

  /** 受影响证书重新核验 */
  function reverifyCertificate(certificateId: string, verified: boolean) {
    const certificate = equipment.value.flatMap((node) => node.certificates).find((value) => value.id === certificateId)
    if (!certificate) return
    certificate.verified = verified
    certificate.version += 1
    log(certificateId, '按新版重算', '现场验收组', `基于V${certificate.version}重新核验：${verified ? '通过' : '不通过'}`)
    persist()
  }

  /** 受影响缺陷按新版重新复验（重算轮次） */
  function retestDefect(defectId: string, result: string, passed: boolean, note: string) {
    const defect = defects.value.find((value) => value.id === defectId)
    if (!defect) return
    defect.retests.unshift({ round: defect.retests.length + 1, passed, result, tester: '联合验收组（换版重算）', testedAt: new Date().toISOString() })
    defect.status = passed ? '已关闭' : '整改中'
    defect.decisionNote = passed ? note : defect.decisionNote
    defect.version += 1
    log(defectId, '按新版重算复验', '联合验收组', result)
    persist()
  }

  /** 受影响回复按新版重新回复（复用原责任方身份，生成新的回复版本） */
  function recomputeReply(defectId: string, oldReplyKeyToken: string, content: string, evidence: string) {
    const defect = defects.value.find((value) => value.id === defectId)
    if (!defect) return
    const index = defect.replies.findIndex((reply) => (reply as PartyReply & { replyKey?: string }).replyKey === oldReplyKeyToken || replyKey(reply) === oldReplyKeyToken)
    if (index < 0) return
    const old = defect.replies[index]
    const fresh: PartyReply & { replyKey?: string } = { party: old.party, owner: old.owner, content, evidence, repliedAt: new Date().toISOString() }
    fresh.replyKey = `RPL-${Date.now().toString(36)}-${idSeed++}`
    defect.replies[index] = fresh
    defect.status = '待联合复验'
    defect.version += 1
    log(defectId, '按新版重算回复', fresh.owner, content)
    persist()
    return fresh.replyKey
  }

  function reset() {
    plant.value = structuredClone(seedPlant)
    equipment.value = structuredClone(seedEquipment)
    defects.value = structuredClone(seedDefects)
    audit.value = structuredClone(seedAudit)
    persist()
  }

  function log(entityId: string, action: string, operator: string, detail: string) {
    audit.value.unshift({ id: `AUD-${Date.now()}-${idSeed++}`, entityId, action, operator, detail, createdAt: new Date().toISOString() })
  }

  return { plant, equipment, defects, audit, selectedEquipmentId, keyword, hydrated, selectedEquipment, stats, preflight, hydrate, updateItem, assignDefect, addReply, addRetest, decideDefect, signOff, invalidateItem, invalidateCertificate, invalidateDefect, invalidateReply, reinspectItem, reverifyCertificate, retestDefect, recomputeReply, reset }
})
