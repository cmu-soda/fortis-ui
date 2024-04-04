import { Algorithm } from '@/api/robustify'
import { RobustnessMode } from '@/api/robustness'
import { WeakeningMode } from './weakening-config'

export const theracRobustnessConfig = {
  sys: 'sys2.lts',
  sys2: '',
  env: 'env0.lts',
  prop: 'p2.lts',
  prop2: '',
  dev: 'dev.lts',
  mode: RobustnessMode.Robustness,
  minimized: true,
  expand: false,
  withDisables: false,
  results: ''
}

export const theracRobustifyConfig = {
  sys: 'sys2.lts',
  env: 'env.lts',
  prop: 'p2.lts',
  progress: '',
  preferredBeh: {
    P0: 'x, enter, b;\ne, enter, b',
    P1: 'x, up, e, enter, b;\ne, up, x, enter, b',
    P2: '',
    P3: ''
  },
  controllable: {
    P0: 'fire_xray, fire_ebeam, set_xray, set_ebeam',
    P1: 'x, e, up, enter, b',
    P2: '',
    P3: ''
  },
  observable: {
    P0: 'x, e, up, enter, b, fire_xray, fire_ebeam, set_xray, set_ebeam',
    P1: '',
    P2: '',
    P3: ''
  },
  algorithm: Algorithm.Fast,
  maxIter: 1,
  solutions: []
}

export const theracWeakeningConfig = {
  sys: 'sys2.lts',
  env: 'env.lts',
  prop: 'p2.lts',
  mode: WeakeningMode.Trace,
  progress: '',
  trace: 'x, up, e, enter, b',
  inputs: '',
  exampleTraces: [],
  exampleTracesPositive: [],
  solutions: '',
  maxNumOfNode: 10
}
