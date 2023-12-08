import { SimpleSpecStore, SpecGroup, SpecType, type SpecStore } from './specs'

export const mockSpecStore: SpecStore = new SimpleSpecStore()

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

mockSpecStore.addSpec(
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

mockSpecStore.addSpec(
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

mockSpecStore.addSpec(
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

mockSpecStore.addSpec(
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

mockSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'p.lts',
    content: p
  },
  SpecGroup.Property
)
