import { specStore } from '@/stores/default-stores'
import { SpecGroup } from '@/stores/specs'

export interface SpecJSON {
  type: string
  content: string
}

export function toSpecJSON(names: string[], group?: SpecGroup): SpecJSON[] {
  const nonemptyNames = names.filter((name) => name !== '')
  const specJSON = names
    .map((name) => specStore.getSpec(name, group))
    .filter((s) => s !== undefined)
    .map((spec) => ({ type: spec!.type, content: spec!.content }))
  if (specJSON.length !== nonemptyNames.length) {
    if (group === undefined)
      throw new Error('Some specs not found in all groups')
    else 
      throw new Error('Some specs not found in ' + Object.values(SpecGroup)[group])
  }
  return specJSON
}

export function toTraces(traces: string): string[][] {
  return traces
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map(toEvents)
}

export function toEvents(events: string): string[] {
  const i = events.indexOf('+')
  if (i === -1) {
    return events
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
  } else {
    const trace = events.substring(0, i)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
    trace.push(events.substring(i))
    return trace
  }
}
