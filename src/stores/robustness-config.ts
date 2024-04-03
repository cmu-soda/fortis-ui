import { RobustnessMode } from '@/api/robustness'

export interface RobustnessConfig {
  sys: string
  sys2: string
  env: string
  prop: string
  prop2: string
  dev: string
  mode: RobustnessMode
  minimized: boolean
  expand: boolean
  withDisables: boolean
  results: string
}

export const emptyRobustnessConfig: RobustnessConfig = {
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
}
