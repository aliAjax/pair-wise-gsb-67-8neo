import type { AcceptanceDefect, AcceptanceItem, Certificate } from '../types/domain'
import type { CloudState, KeyedReply } from '../types/sync'
import { seedDefects, seedEquipment } from '../data/seed'
import { replyKey } from './edition'

const CLOUD_KEY = 'gsb67:authoritative-cloud'
const NETWORK_KEY = 'gsb67:network-sim'

/** 测试环境（非 Vite 运行时）强制按客户端处理本地持久化 */
let forceClient = false
export function setCloudClientForce(value: boolean) { forceClient = value }
const isClient = () => import.meta.client || forceClient

export interface NetworkSim {
  online: boolean
  failNextWrite: boolean
}

/** 以验收基线种子构造云端权威库（云端版本可被“换版”操作更新） */
export function buildCloudSeed(): CloudState {
  const items: CloudState['items'] = {}
  const certificates: CloudState['certificates'] = {}
  seedEquipment.forEach((node) => {
    node.items.forEach((item) => { items[item.id] = { equipmentId: node.id, item: structuredClone(item) } })
    node.certificates.forEach((certificate) => { certificates[certificate.id] = { equipmentId: node.id, certificate: structuredClone(certificate) } })
  })
  const defects: CloudState['defects'] = {}
  const replies: CloudState['replies'] = {}
  seedDefects.forEach((defect) => {
    defects[defect.id] = structuredClone(defect)
    defect.replies.forEach((reply) => {
      const key = replyKey(reply)
      replies[key] = { defectId: defect.id, reply: { ...structuredClone(reply), replyKey: key } }
    })
  })
  return { items, certificates, defects, replies, signedBatches: [], mergedRefs: [] }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 模拟电站平台服务端：独立持久化，车辆现场完全不访问它。
 * 网络恢复后车辆才逐项合并；任何写入都可能被置为失败以验证恢复。
 */
export function useCloudService() {
  function loadNetwork(): NetworkSim {
    if (!isClient()) return { online: true, failNextWrite: false }
    const raw = localStorage.getItem(NETWORK_KEY)
    return raw ? JSON.parse(raw) : { online: false, failNextWrite: false }
  }
  function saveNetwork(value: NetworkSim) {
    if (isClient()) localStorage.setItem(NETWORK_KEY, JSON.stringify(value))
  }

  function load(): CloudState {
    if (!isClient()) return buildCloudSeed()
    const raw = localStorage.getItem(CLOUD_KEY)
    if (!raw) {
      const seed = buildCloudSeed()
      localStorage.setItem(CLOUD_KEY, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw)
  }
  function save(state: CloudState) {
    if (isClient()) localStorage.setItem(CLOUD_KEY, JSON.stringify(state))
  }
  function reset() {
    if (isClient()) localStorage.removeItem(CLOUD_KEY)
  }

  /**
   * 模拟平台侧换版（现场离线期间发生）：
   * 验收项标准修订、证书换版、缺陷责任与期限调整、多方回复内容修订各一处。
   */
  function applyDrift(): string[] {
    const state = load()
    const notes: string[] = []
    const g1 = state.items['IT-G1']?.item
    if (g1 && g1.version < 3) {
      g1.standard = '保护定值与调度单及新版反措要求一致（2026修订）'
      g1.version = 3
      notes.push('验收项 IT-G1 换版 V3：保护定值标准加入新版反措要求')
    }
    const ci1 = state.certificates['C-I1']?.certificate
    if (ci1 && ci1.version < 3) {
      ci1.issuer = '中国电科院（新能源并网检测中心）'
      ci1.expiresAt = '2029-06-30'
      ci1.version = 3
      notes.push('证书 C-I1 换版 V3：低电压穿越证书换发，签发机构与有效期变化')
    }
    const d1 = state.defects['AD-260929-01']
    if (d1 && d1.version < 5) {
      d1.owner = '建设单位'
      d1.dueDate = '2026-10-06'
      d1.version = 5
      notes.push('缺陷 AD-260929-01 换版 V5：责任方调整为建设单位，期限延至10-06')
    }
    const d2reply = Object.values(state.replies).find((entry) => entry.defectId === 'AD-260929-02' && entry.reply.party === '运维单位')
    if (d2reply && (d2reply.reply.replyVersion ?? 1) < 2) {
      d2reply.reply.content = '复测条件部分满足，辐照度时段需重新见证，建议增加第二轮联合见证。'
      d2reply.reply.replyVersion = 2
      notes.push('多方回复（AD-260929-02 运维单位罗宇）换版：复测条件说明修订')
    }
    save(state)
    return notes
  }

  async function fetchState(): Promise<CloudState> {
    const net = loadNetwork()
    await delay(420)
    if (!net.online) throw new Error('现场离线：无法连接电站平台')
    return load()
  }

  /**
   * 逐项写入。返回幂等命中时 applied=false（重复回传不重复签署）。
   * failNextWrite 打开时，本项写入失败且自动复位开关，用于验证“写入失败后从未完成项恢复”。
   */
  async function writeMergedRef(key: string, patch?: Partial<{
    item: { equipmentId: string; item: AcceptanceItem }
    certificate: { equipmentId: string; certificate: Certificate }
    defect: AcceptanceDefect
    reply: { defectId: string; reply: KeyedReply }
  }>): Promise<{ applied: boolean; duplicate: boolean }> {
    const net = loadNetwork()
    await delay(260)
    if (!net.online) throw new Error('网络已断开，写入未到达平台')
    if (net.failNextWrite) {
      saveNetwork({ ...net, failNextWrite: false })
      throw new Error('平台写入超时（模拟故障已自动复位，可恢复回传）')
    }
    const state = load()
    if (state.mergedRefs.includes(key)) return { applied: false, duplicate: true }
    state.mergedRefs.push(key)
    if (patch?.item) state.items[patch.item.item.id] = patch.item
    if (patch?.certificate) state.certificates[patch.certificate.certificate.id] = patch.certificate
    if (patch?.defect) state.defects[patch.defect.id] = patch.defect
    if (patch?.reply) state.replies[patch.reply.reply.replyKey!] = patch.reply
    save(state)
    return { applied: true, duplicate: false }
  }

  async function releaseBatch(batchId: string, idempotencyKey: string): Promise<{ duplicate: boolean; releasedAt: string }> {
    const net = loadNetwork()
    await delay(320)
    if (!net.online) throw new Error('网络已断开，放行未到达平台')
    const state = load()
    const existing = state.signedBatches.find((item) => item.idempotencyKey === idempotencyKey || item.batchId === batchId)
    if (existing) return { duplicate: true, releasedAt: existing.releasedAt }
    const releasedAt = new Date().toISOString()
    state.signedBatches.push({ batchId, idempotencyKey, releasedAt })
    save(state)
    return { duplicate: false, releasedAt }
  }

  return { load, save, reset, applyDrift, fetchState, writeMergedRef, releaseBatch, loadNetwork, saveNetwork }
}
