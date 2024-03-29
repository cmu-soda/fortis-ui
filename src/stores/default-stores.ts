import { reactive, ref } from 'vue'
import { SimpleSpecStore, type SpecStore } from './specs'
import { mockSpecStore } from './specs-mock'
import { Algorithm } from '@/api/robustify'
import type { RobustifyConfig } from './robustify-config'
import type { RobustnessConfig } from './robustness-config'
import { RobustnessMode } from '@/api/robustness'
import { WeakeningMode, type WeakeningConfig } from './weakening-config'

export const specStore: SpecStore = reactive(mockSpecStore)

export const robustifyConfigStore: RobustifyConfig = reactive({
  sys: '',
  env: '',
  prop: '',
  progress: '',
  preferredBeh: {
    P1: '',
    P2: '',
    P3: ''
  },
  controllable: {
    P0: '',
    P1: '',
    P2: '',
    P3: ''
  },
  observable: {
    P0: '',
    P1: '',
    P2: '',
    P3: ''
  },
  algorithm: Algorithm.Fast,
  maxIter: 1,
  solutions: []
})

export const robustnessConfigStore: RobustnessConfig = reactive({
  sys: '',
  sys2: '',
  env: '',
  prop: '',
  prop2: '',
  dev: '',
  mode: RobustnessMode.Robustness,
  minimized: true,
  expand: false,
  withDisables: false,
  results: ''
})

export const weakeningConfigStore: WeakeningConfig = reactive({
  sys: '',
  env: '',
  prop: '',
  mode: WeakeningMode.Trace,
  progress: '',
  trace: '',
  inputs: '',
  exampleTraces: [],
  exampleTracesPositive: [],
  solutions: ''
})

export const loggingStore = ref('')
