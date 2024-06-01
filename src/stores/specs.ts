import { eventEmitter } from './events'

export enum SpecType {
  FSP = 'FSP',
  AUT = 'AUT',
  FSM = 'FSM',
  FLTL = 'FLTL'
}

export interface Spec {
  type: SpecType
  name: string
  content: string
  changed?: boolean
  cached?: string
  group?: SpecGroup
}

export enum SpecGroup {
  Machine,
  Environment,
  Property
}

export interface SpecStore {
  sysSpecs: Spec[]
  envSpecs: Spec[]
  propSpecs: Spec[]

  selected?: Spec

  getSpec(name: string, group: SpecGroup): Spec | undefined

  addSpec(spec: Spec, group: SpecGroup): void

  removeSpec(name: string, group: SpecGroup): void

  updateSpec(name: string, content: string, group: SpecGroup): void

  selectSpec(name: string, group: SpecGroup): void

  reloadSelected(): void

  saveSelected(): void
}

export class SimpleSpecStore implements SpecStore {
  sysSpecs: Spec[] = []
  envSpecs: Spec[] = []
  propSpecs: Spec[] = []

  selected?: Spec

  getSpec(name: string, group: SpecGroup): Spec | undefined {
    switch (group) {
      case SpecGroup.Machine:
        return this.sysSpecs.find((spec) => spec.name === name)
      case SpecGroup.Environment:
        return this.envSpecs.find((spec) => spec.name === name)
      case SpecGroup.Property:
        return this.propSpecs.find((spec) => spec.name === name)
    }
  }

  selectSpec(name: string, group: SpecGroup): void {
    switch (group) {
      case SpecGroup.Machine:
        this.selected = this.sysSpecs.find((spec) => spec.name === name)
        break
      case SpecGroup.Environment:
        this.selected = this.envSpecs.find((spec) => spec.name === name)
        break
      case SpecGroup.Property:
        this.selected = this.propSpecs.find((spec) => spec.name === name)
        break
    }
  }

  addSpec(spec: Spec, group: SpecGroup): void {
    spec.group = group
    spec.cached = spec.content
    spec.changed = false
    switch (group) {
      case SpecGroup.Machine:
        this.sysSpecs.push(spec)
        break
      case SpecGroup.Environment:
        this.envSpecs.push(spec)
        break
      case SpecGroup.Property:
        this.propSpecs.push(spec)
        break
    }
  }

  removeSpec(name: string, group: SpecGroup): void {
    switch (group) {
      case SpecGroup.Machine:
        this.sysSpecs = this.sysSpecs.filter((spec) => spec.name !== name)
        break
      case SpecGroup.Environment:
        this.envSpecs = this.envSpecs.filter((spec) => spec.name !== name)
        break
      case SpecGroup.Property:
        this.propSpecs = this.propSpecs.filter((spec) => spec.name !== name)
        break
    }
  }

  updateSpec(name: string, content: string, group: SpecGroup): void {
    switch (group) {
      case SpecGroup.Machine:
        this.sysSpecs = this.sysSpecs.map((spec) =>
          spec.name === name ? { ...spec, content, changed: false } : spec
        )
        break
      case SpecGroup.Environment:
        this.envSpecs = this.envSpecs.map((spec) =>
          spec.name === name ? { ...spec, content, changed: false } : spec
        )
        break
      case SpecGroup.Property:
        this.propSpecs = this.propSpecs.map((spec) =>
          spec.name === name ? { ...spec, content, changed: false } : spec
        )
        break
    }
  }

  reloadSelected(): void {
    if (this.selected) {
      this.selected.cached = this.selected.content
      this.selected.changed = false
      eventEmitter.reloadSelectedTrigger = !eventEmitter.reloadSelectedTrigger
    }
  }

  saveSelected(): void {
    if (this.selected && this.selected.cached) {
      this.updateSpec(this.selected.name, this.selected.cached, this.selected.group!)
    }
  }
}
