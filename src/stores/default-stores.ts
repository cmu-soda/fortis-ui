import { reactive } from 'vue'
import { SimpleSpecStore, type SpecStore } from './specs'
import { theracSpecStore } from './specs-mock'
import type { RobustifyConfig } from './robustify-config'
import type { RobustnessConfig } from './robustness-config'
import { type WeakeningConfig } from './weakening-config'
import { theracRobustifyConfig, theracRobustnessConfig, theracWeakeningConfig } from './config-mock'

export const specStore: SpecStore = reactive(theracSpecStore)

export const robustnessConfigStore: RobustnessConfig = reactive(theracRobustnessConfig)

export const robustifyConfigStore: RobustifyConfig = reactive(theracRobustifyConfig)

export const weakeningConfigStore: WeakeningConfig = reactive(theracWeakeningConfig)

export const loggingStore = reactive({
  content: '',

  log(msg: string) {
    this.content += msg
    if (this.content.length > 10000) {
      this.content = this.content.substring(this.content.length - 10000)
    }
  }
})
