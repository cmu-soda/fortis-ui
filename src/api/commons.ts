import { specStore } from '@/stores/default-stores'
import { SpecGroup } from '@/stores/specs'

export interface SpecJSON {
  type: string
  content: string
}

export function toSpecJSON(names: string[], group: SpecGroup): SpecJSON[] {
  const nonemptyNames = names.filter((name) => name !== '')
  const specJSON = names
    .map((name) => specStore.getSpec(name, group))
    .filter((s) => s !== undefined)
    .map((spec) => ({ type: spec!.type, content: spec!.content }))
  if (specJSON.length !== nonemptyNames.length) {
    throw new Error('Some specs not found in ' + Object.values(SpecGroup)[group])
  }
  return specJSON
}

export function toTraces(traces: string): string[][] {
  return traces
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => s.split(',').map((e) => e.trim()))
}

export function toEvents(events: string): string[] {
  return events
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
}
