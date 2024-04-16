import { Algorithm } from '@/api/robustify'
import { RobustnessMode } from '@/api/robustness'
import { SimpleSpecStore, SpecGroup, SpecType, type SpecStore } from './specs'
import { WeakeningMode } from './weakening-config'

export const theracSpecStore: SpecStore = new SimpleSpecStore()

const sys = `const IntNotSet = 0
const IntXray = 1
const IntEBeam = 2
range IntModeState = IntNotSet .. IntEBeam

INTERFACE = INTERFACE[IntNotSet],
INTERFACE[mode:IntModeState] = (x -> CONFIRM[IntXray] | e -> CONFIRM[IntEBeam]),
CONFIRM[mode:IntModeState] = (up -> INTERFACE | enter -> FIRE[mode]),
FIRE[mode:IntModeState] = (
    when (mode == IntXray) b -> fire_xray -> enter -> INTERFACE
    |
    when (mode == IntEBeam) b -> fire_ebeam -> enter -> INTERFACE
    |
    up -> CONFIRM[mode]
).

BEAM = (x -> XRAY | e -> EBeam),
XRAY = (x -> XRAY | e -> ToEBeam),
ToEBeam = (setMode -> EBeam | x -> XRAY | e -> ToEBeam),
EBeam = (e -> EBeam | x -> ToXray),
ToXray = (setMode -> XRAY | e -> EBeam | x -> ToXray).

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

const sys2 = `INTERFACE = (x -> CONFIRM | e -> CONFIRM),
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
    name: 'sys2.lts',
    content: sys2
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

const p = `const InPlace = 0
const OutPlace = 1
range SpreaderState = InPlace .. OutPlace

const NotSet = 2
const Xray = 3
const EBeam = 4
const ToXray = 5
const ToEBeam = 6
range BeamState = NotSet .. ToEBeam

P = P[InPlace][NotSet],
P[spreader:SpreaderState][power:BeamState] = (
    when (power == NotSet || power == Xray || power == ToEBeam) x -> P[InPlace][Xray]
    |
    when (power == NotSet || power == EBeam || power == ToXray) e -> P[OutPlace][EBeam]
    |
    when (power == Xray || power == ToEBeam) e -> P[OutPlace][ToEBeam]
    |
    when (power == EBeam || power == ToXray) x -> P[InPlace][ToXray]
    |
    when (power == ToEBeam) setMode -> P[spreader][EBeam]
    |
    when (power == ToXray) setMode -> P[spreader][Xray]
    |
    when (power != NotSet && (spreader != OutPlace || power == EBeam || power == ToXray)) b -> P[spreader][power]
).
`

theracSpecStore.addSpec(
  {
    type: SpecType.FSP,
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
