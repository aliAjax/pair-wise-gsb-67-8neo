export type InspectionStatus = '待检查' | '合格' | '不合格' | '待复验'
export type DefectStatus = '待分派' | '整改中' | '待联合复验' | '已关闭' | '带条件通过'
export type Party = '建设单位' | '设备厂家' | '运维单位'

export interface AcceptanceItem {
  id: string
  standard: string
  method: string
  condition: string
  status: InspectionStatus
  measured: string
  evidence: string
  version: number
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  expiresAt: string
  version: number
  verified: boolean
}

export interface EquipmentNode {
  id: string
  parentId: string | null
  name: string
  type: '并网点' | '变压器' | '方阵' | '逆变器' | '汇流箱'
  code: string
  status: '待验收' | '验收中' | '已验收'
  items: AcceptanceItem[]
  certificates: Certificate[]
}

export interface PartyReply {
  party: Party
  owner: string
  content: string
  evidence: string
  repliedAt: string
}

export interface AcceptanceDefect {
  id: string
  equipmentId: string
  itemId: string
  title: string
  severity: '一般' | '重大'
  status: DefectStatus
  owner: string
  dueDate: string
  replies: PartyReply[]
  retests: Array<{ round: number; passed: boolean; result: string; tester: string; testedAt: string }>
  decisionNote: string
  version: number
}

export interface Plant {
  id: string
  name: string
  gridPoint: string
  capacity: string
  commissioningDate: string
  status: '验收中' | '待复核' | '已签署'
  version: number
}

export type BatchEntryKind = '验收项' | '缺陷' | '证书' | '多方回复'
export type BatchEntryStatus = '待回传' | '已合并' | '冲突' | '已失效重算'
export type SignBatchStatus = '待回传' | '部分回传' | '待复核' | '已合并' | '已确认'

export interface SignBatchEntry {
  key: string
  kind: BatchEntryKind
  entityId: string
  parentId: string | null
  seenVersion: number
  conclusion: string
  status: BatchEntryStatus
  mergedAt: string | null
}

export interface VersionConflict {
  id: string
  batchId: string
  kind: BatchEntryKind
  entityId: string
  seenVersion: number
  currentVersion: number
  offlineConclusion: string
  currentConclusion: string
  detectedAt: string
  resolved: boolean
}

export interface SignBatch {
  id: string
  plantId: string
  createdBy: string
  createdAt: string
  status: SignBatchStatus
  entries: SignBatchEntry[]
  conflicts: VersionConflict[]
  confirmedBy: string | null
  confirmedAt: string | null
}

export interface AuditEntry {
  id: string
  entityId: string
  action: string
  operator: string
  detail: string
  createdAt: string
}
