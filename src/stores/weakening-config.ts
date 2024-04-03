export enum WeakeningMode {
  Progress,
  Trace
}

export interface WeakeningConfig {
  sys: string
  env: string
  prop: string
  mode: WeakeningMode
  progress: string
  trace: string
  inputs: string
  exampleTraces: string[]
  exampleTracesPositive: boolean[]
  solutions: string
}

export const emptyWeakeningConfig: WeakeningConfig = {
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
}
