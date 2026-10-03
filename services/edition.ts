import type { AcceptanceDefect, AcceptanceItem, Certificate, PartyReply } from '../types/domain'
import type { EditionSnapshot, BasisKind } from '../types/sync'

/**
 * 版本指纹：只覆盖“依据版本”字段，不含现场结论/状态。
 * 证书或验收项换版（标准、方法、条件、签发方、有效期等）必然改变指纹。
 */
export function fingerprint(snapshot: EditionSnapshot): string {
  const json = JSON.stringify(snapshot.fields, Object.keys(snapshot.fields).sort())
  let hash = 0x811c9dc5
  for (let i = 0; i < json.length; i += 1) {
    hash ^= json.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function itemEdition(item: AcceptanceItem): EditionSnapshot {
  return {
    editionVersion: item.version,
    fields: { standard: item.standard, method: item.method, condition: item.condition }
  }
}

export function certificateEdition(certificate: Certificate): EditionSnapshot {
  return {
    editionVersion: certificate.version,
    fields: { name: certificate.name, issuer: certificate.issuer, expiresAt: certificate.expiresAt }
  }
}

export function defectEdition(defect: AcceptanceDefect): EditionSnapshot {
  return {
    editionVersion: defect.version,
    fields: {
      title: defect.title,
      severity: defect.severity,
      owner: defect.owner,
      dueDate: defect.dueDate,
      // 仅记录复验轮次与通过情况；多方回复内容由“多方回复”依据单独按版本跟踪
      retestRounds: defect.retests.map((round) => `${round.round}:${round.passed}`).join('|')
    }
  }
}

export function replyEdition(reply: PartyReply & { replyVersion?: number }): EditionSnapshot {
  return {
    editionVersion: reply.replyVersion ?? 1,
    fields: { party: reply.party, owner: reply.owner, content: reply.content, evidence: reply.evidence }
  }
}

/** 单条多方回复的稳定身份键：同责任方同时间点的回复，换版不改身份 */
export function replyKey(reply: PartyReply): string {
  const basis = `${reply.repliedAt}|${reply.party}|${reply.owner}`
  let hash = 0
  for (let i = 0; i < basis.length; i += 1) hash = (hash * 31 + basis.charCodeAt(i)) | 0
  return `RPL-${(hash >>> 0).toString(36)}`
}

export function kindLabel(kind: BasisKind): string {
  return kind
}

/** 结论描述：现场签署时冻结实际看过的对象状态 */
export function itemConclusion(item: AcceptanceItem): string {
  return `验收结论：${item.status}；实测：${item.measured || '无'}；证据：${item.evidence || '无'}`
}
export function certificateConclusion(certificate: Certificate): string {
  return `核验结论：${certificate.verified ? '已核验' : '待核验'}；有效期至 ${certificate.expiresAt}`
}
export function defectConclusion(defect: AcceptanceDefect): string {
  return `缺陷结论：${defect.status}；责任方：${defect.owner}；复验${defect.retests.length}轮`
}
export function replyConclusion(reply: PartyReply): string {
  return `${reply.party}（${reply.owner}）回复：${reply.content}`
}

/** 两版差异，逐项列出，冲突全部留痕 */
export function diffEditions(field: EditionSnapshot, cloud: EditionSnapshot): string[] {
  const diffs: string[] = []
  const keys = new Set([...Object.keys(field.fields), ...Object.keys(cloud.fields)])
  keys.forEach((key) => {
    const a = field.fields[key]
    const b = cloud.fields[key]
    if (String(a) !== String(b)) diffs.push(`${key}: V${field.editionVersion}=「${a ?? '∅'}」 → V${cloud.editionVersion}=「${b ?? '∅'}」`)
  })
  return diffs
}
