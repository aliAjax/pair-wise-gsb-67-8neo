import type { AcceptanceDefect, AcceptanceItem, Certificate, PartyReply } from './domain'

/** 依据绑定的对象类型：缺陷、验收项、证书、多方回复、签署批次全部绑成一份依据 */
export type BasisKind = '验收项' | '证书' | '缺陷' | '多方回复'

export type MergeState =
  | '未回传' // 现场已签署，尚未随批次回传
  | '合并一致' // 云端版本未换版，离线结论已逐项合并
  | '版本冲突' // 证书/验收项/缺陷已换版，结论退回
  | '待写入' // 恢复时从未完成项继续，等待写入
  | '写入失败' // 该项写入失败，批次回传中断后可恢复
  | '已失效待重算' // 建设单位确认后，仅受影响对象失效
  | '重算完成待放行' // 受影响对象已按新版重算，等待批次放行
  | '已放行' // 批次放行，结论生效

/** 批次生命周期：任何一处版本变化都把该批退回待复核，禁止沿用旧结论放行 */
export type BatchStatus =
  | '离线待回传'
  | '回传中'
  | '回传中断' // 写入失败：保留完成项，从未完成项恢复
  | '退回待复核' // 发现版本冲突，整批退回
  | '待重算' // 建设单位已确认，受影响对象失效重算中
  | '重算完成待放行'
  | '已放行'

/** 现场签署时记录的“实际看过的版本” */
export interface BasisRef {
  kind: BasisKind
  objectId: string
  equipmentId?: string
  defectId?: string
  label: string
  editionVersion: number
  editionFingerprint: string
  snapshot: EditionSnapshot
  conclusion: string
}

/** 版本描述（用于换版比对，结论不参与指纹） */
export interface EditionSnapshot {
  editionVersion: number
  fields: Record<string, string | number | boolean>
}

export interface MergeLine {
  refId: string
  kind: BasisKind
  objectId: string
  equipmentId?: string
  defectId?: string
  label: string
  /** 现场实际看过的版本号与指纹 */
  fieldEdition: number
  fieldFingerprint: string
  /** 回传时云端版本号与指纹 */
  cloudEdition?: number
  cloudFingerprint?: string
  state: MergeState
  /** 云端换版时的新版描述，供复核展示 */
  cloudSnapshot?: EditionSnapshot
  /** 两版冲突差异 */
  diffs?: string[]
  /** 重复回传去重键（refId+batchId 幂等） */
  mergeKey: string
  appliedAt?: string
  failReason?: string
}

export interface OldConclusion {
  refId: string
  label: string
  fieldEdition: number
  cloudEdition: number
  conclusion: string
  kept: boolean
}

/** 两版冲突全部留下：旧结论与新版冲突并存 */
export interface VersionConflict {
  id: string
  batchId: string
  refId: string
  kind: BasisKind
  objectId: string
  defectId?: string
  label: string
  fieldEdition: number
  cloudEdition: number
  fieldSnapshot: EditionSnapshot
  cloudSnapshot: EditionSnapshot
  diffs: string[]
  oldConclusion: string
  status: '待建设单位确认' | '已确认失效' | '已重算'
  createdAt: string
  confirmedAt?: string
  recalculatedAt?: string
}

export interface BatchEvent {
  at: string
  type: string
  message: string
}

export interface SigningBatch {
  id: string
  vehicleId: string
  site: string
  signedAt: string
  signer: string
  status: BatchStatus
  refs: BasisRef[]
  lines: MergeLine[]
  conflicts: VersionConflict[]
  /** 保留的旧结论（换版对象的旧结论不覆盖、不删除） */
  oldConclusions: OldConclusion[]
  events: BatchEvent[]
  /** 幂等键：同一批次重复回传不重复签署 */
  idempotencyKey: string
  uploadedAt?: string
  releasedAt?: string
}

export type KeyedReply = PartyReply & { replyKey: string; replyVersion?: number }

/** 现场车辆离线缓存（基线 + 未回传批次） */
export interface VehicleBaseline {
  downloadedAt: string
  items: Array<{ equipmentId: string; item: AcceptanceItem }>
  certificates: Array<{ equipmentId: string; certificate: Certificate }>
  defects: AcceptanceDefect[]
  replies: Array<{ defectId: string; reply: KeyedReply }>
}

/** 云端权威版本库（模拟平台服务端，独立持久化） */
export interface CloudState {
  items: Record<string, { equipmentId: string; item: AcceptanceItem }>
  certificates: Record<string, { equipmentId: string; certificate: Certificate }>
  defects: Record<string, AcceptanceDefect>
  replies: Record<string, { defectId: string; reply: KeyedReply }>
  signedBatches: Array<{ batchId: string; idempotencyKey: string; releasedAt: string }>
  mergedRefs: string[] // 已合并 ref 键（batchId:refId），保证重复回传不重复写入/签署
}
