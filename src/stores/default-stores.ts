import { reactive } from 'vue'
import { SimpleSpecStore, type SpecStore } from './specs'
import {
  theracSpecStore,
  theracRobustifyConfig,
  theracRobustnessConfig,
  theracWeakeningConfig
} from './specs-therac25'
import { emptyRobustifyConfig, type RobustifyConfig } from './robustify-config'
import { emptyRobustnessConfig, type RobustnessConfig } from './robustness-config'
import { emptyWeakeningConfig, type WeakeningConfig } from './weakening-config'
import {
  votingRobustifyConfig,
  votingRobustnessConfig,
  votingSpecStore,
  votingWeakeningConfig
} from './specs-voting'
import {
  pumpSpecStore,
  pumpRobustifyConfig,
  pumpRobustnessConfig,
  pumpWeakeningConfig
} from './spec-pump'
import {
  oysterRobustifyConfig,
  oysterRobustnessConfig,
  oysterSpecStore,
  oysterWeakeningConfig
} from './spec-oyster'

export const specStore: SpecStore = reactive(new SimpleSpecStore())

export const robustnessConfigStore: RobustnessConfig = reactive(emptyRobustnessConfig)

export const robustifyConfigStore: RobustifyConfig = reactive(emptyRobustifyConfig)

export const weakeningConfigStore: WeakeningConfig = reactive(emptyWeakeningConfig)

export const loggingStore = reactive({
  content: '',

  log(msg: string) {
    this.content += msg
    if (this.content.length > 10000) {
      this.content = this.content.substring(this.content.length - 10000)
    }
  },

  clear() {
    this.content = ''
  }
})

export function loadTherac25() {
  // update specStore with data from theracSpecStore
  Object.assign(specStore, theracSpecStore)
  Object.assign(robustifyConfigStore, theracRobustifyConfig)
  Object.assign(robustnessConfigStore, theracRobustnessConfig)
  Object.assign(weakeningConfigStore, theracWeakeningConfig)
}

export function loadVoting() {
  Object.assign(specStore, votingSpecStore)
  Object.assign(robustifyConfigStore, votingRobustifyConfig)
  Object.assign(robustnessConfigStore, votingRobustnessConfig)
  Object.assign(weakeningConfigStore, votingWeakeningConfig)
}

export function loadOyster() {
  Object.assign(specStore, oysterSpecStore)
  Object.assign(robustifyConfigStore, oysterRobustifyConfig)
  Object.assign(robustnessConfigStore, oysterRobustnessConfig)
  Object.assign(weakeningConfigStore, oysterWeakeningConfig)
}

export function loadInfusionPump() {
  Object.assign(specStore, pumpSpecStore)
  Object.assign(robustifyConfigStore, pumpRobustifyConfig)
  Object.assign(robustnessConfigStore, pumpRobustnessConfig)
  Object.assign(weakeningConfigStore, pumpWeakeningConfig)
}
