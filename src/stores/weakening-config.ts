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
