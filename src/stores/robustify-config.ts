import { Algorithm, type RobustificationResult } from '@/api/robustify'

export interface RobustifyConfig {
  sys: string
  env: string
  prop: string
  progress: string
  preferredBeh: {
    P0: string
    P1: string
    P2: string
    P3: string
  }
  controllable: {
    P0: string
    P1: string
    P2: string
    P3: string
  }
  observable: {
    P0: string
    P1: string
    P2: string
    P3: string
  }
  algorithm: Algorithm
  maxIter: number
  solutions: RobustificationResult[]
}

export const emptyRobustifyConfig: RobustifyConfig = {
  sys: '',
  env: '',
  prop: '',
  progress: '',
  preferredBeh: {
    P0: '',
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
}
