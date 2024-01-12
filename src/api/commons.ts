import { specStore } from '@/stores/default-stores'
import type { SpecGroup } from '@/stores/specs'

export interface SpecJSON {
  type: string
  content: string
}

export function toSpecJSON(names: string[], group: SpecGroup): SpecJSON[] | undefined {
  const specJSON = names
    .map((name) => specStore.getSpec(name, group))
    .filter((s) => s !== undefined)
    .map((spec) => ({ type: spec!.type, content: spec!.content }))
  if (specJSON.length === 0) {
    return undefined
  }
  return specJSON
}
