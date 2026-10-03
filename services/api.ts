import { ofetch } from 'ofetch'
import type { EquipmentNode } from '../types/domain'

const client = ofetch.create({ baseURL: process.env.NUXT_PUBLIC_API_BASE_URL || '/api', timeout: 5000 })

export async function loadEquipmentSnapshot(fallback: EquipmentNode[]): Promise<EquipmentNode[]> {
  if (!process.env.NUXT_PUBLIC_API_BASE_URL) return fallback
  try { return await client<EquipmentNode[]>('/acceptance/equipment') } catch { return fallback }
}

export async function validateEvidencePackage(payload: unknown) {
  if (!process.env.NUXT_PUBLIC_API_BASE_URL) return { accepted: true, packageId: `LOCAL-${Date.now()}` }
  return client('/acceptance/validate-package', { method: 'POST', body: payload })
}
