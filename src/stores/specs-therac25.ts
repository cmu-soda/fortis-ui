import { Algorithm } from '@/api/robustify'
import { RobustnessMode } from '@/api/robustness'
import { SimpleSpecStore, SpecGroup, SpecType, type SpecStore } from './specs'
import { WeakeningMode } from './weakening-config'

export const theracSpecStore: SpecStore = new SimpleSpecStore()

const sys = `INTERFACE = (x -> CONFIRM | e -> CONFIRM),
CONFIRM = (up -> INTERFACE | enter -> FIRE),
FIRE = (up -> CONFIRM | b -> enter -> INTERFACE).

const NotSet = 0
const Xray = 1
const EBeam = 2
range BeamState = NotSet .. EBeam

const ToXray = 3
const ToEBeam = 4
range BeamSwitch = ToXray .. ToEBeam

BEAM = BEAM[NotSet],
BEAM[mode:BeamState] = (
    when (mode == NotSet) x -> set_xray -> BEAM[Xray]
    |
    when (mode == NotSet) e -> set_ebeam -> BEAM[EBeam]
    |
    // Xray mode
    when (mode == Xray) x -> BEAM[Xray]
    |
    when (mode == Xray) e -> BEAM_SWITCH[ToEBeam]
    |
    when (mode == Xray) b -> fire_xray -> reset -> BEAM
    |
    // EBeam mode
    when (mode == EBeam) e -> BEAM[EBeam]
    |
    when (mode == EBeam) x -> BEAM_SWITCH[ToXray]
    |
    when (mode == EBeam) b -> fire_ebeam -> reset -> BEAM
),
BEAM_SWITCH[switch:BeamSwitch] = (
    // EBeam to Xray
    when (switch == ToXray) x -> BEAM_SWITCH[ToXray]
    |
    when (switch == ToXray) e -> BEAM[EBeam]
    |
    when (switch == ToXray) b -> fire_ebeam -> reset -> BEAM
    |
    when (switch == ToXray) set_xray -> BEAM[Xray]
    |
    // Xray to EBeam
    when (switch == ToEBeam) e -> BEAM_SWITCH[ToEBeam]
    |
    when (switch == ToEBeam) x -> BEAM[Xray]
    |
    when (switch == ToEBeam) b -> fire_xray -> reset -> BEAM
    |
    when (switch == ToEBeam) set_ebeam -> BEAM[EBeam]
).

SPREADER = (e -> OUTPLACE | x -> SPREADER),
OUTPLACE = (e -> OUTPLACE | x -> SPREADER).

||SYS = (INTERFACE || BEAM || SPREADER).
`

theracSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'sys.lts',
    content: sys
  },
  SpecGroup.System
)

const env0 = `ENV = (x -> ENV_1 | e -> ENV_1),
ENV_1 = (enter -> ENV_2),
ENV_2 = (b -> enter -> ENV)+{up}.        
`

theracSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'env0.lts',
    content: env0
  },
  SpecGroup.Environment
)

const env = `ENV = (x -> ENV_1 | e -> ENV_1),
ENV_1 = (enter -> ENV_2 | up -> ENV),
ENV_2 = (b -> enter -> ENV | up -> ENV_1).        
`

theracSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'env.lts',
    content: env
  },
  SpecGroup.Environment
)

const dev = `ENV = (x -> ENV_1 | e -> ENV_1),
ENV_1 = (enter -> ENV_2 | commission -> up -> ENV),
ENV_2 = (b -> enter -> ENV | commission -> up -> ENV_1).
`

theracSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'dev.lts',
    content: dev
  },
  SpecGroup.Environment
)

const p = `fluent Xray = <set_xray, {set_ebeam, reset}>
fluent EBeam = <set_ebeam, {set_xray, reset}>
fluent InPlace = <x, e> initially 1
fluent Fired = <{fire_xray, fire_ebeam}, reset>

assert OVER_DOSE = [](Xray && Fired -> InPlace)
`

theracSpecStore.addSpec(
  {
    type: SpecType.FLTL,
    name: 'p.lts',
    content: p
  },
  SpecGroup.Property
)

const p2 = `fluent Xray = <set_xray, {set_ebeam, reset}>
fluent EBeam = <set_ebeam, {set_xray, reset}>
fluent InPlace = <x, e> initially 1
fluent Fired = <{fire_xray, fire_ebeam}, reset>

assert OVER_DOSE = [](Xray -> InPlace)
`

theracSpecStore.addSpec(
  {
    type: SpecType.FLTL,
    name: 'p2.lts',
    content: p2
  },
  SpecGroup.Property
)

export const theracRobustnessConfig = {
  sys: 'sys.lts',
  sys2: '',
  env: 'env0.lts',
  prop: 'p.lts',
  prop2: '',
  dev: 'dev.lts',
  mode: RobustnessMode.Robustness,
  minimized: true,
  expand: false,
  withDisables: false,
  results: ''
}

export const theracRobustifyConfig = {
  sys: 'sys.lts',
  env: 'env.lts',
  prop: 'p.lts',
  progress: 'fire_xray, fire_ebeam',
  preferredBeh: {
    P0: '',
    P1: '',
    P2: 'x, enter, up, up, e, enter, b;\ne, enter, up, up, x, enter, b',
    P3: 'x, up, e, enter, b;\ne, up, x, enter, b'
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
  sys: 'sys.lts',
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
