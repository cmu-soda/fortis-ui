import { Algorithm } from '@/api/robustify'
import { RobustnessMode } from '@/api/robustness'
import { SimpleSpecStore, SpecGroup, SpecType, type SpecStore } from './specs'
import { WeakeningMode } from './weakening-config'

export const votingSpecStore: SpecStore = new SimpleSpecStore()

const sys = `EM = (password -> P1),
P1 = (select -> P2 | reset -> EM),
P2 = (vote -> P3 | back -> P1 | reset -> EM),
P3 = (confirm -> EM | back -> P2 | reset -> EM).
`

votingSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'sys.lts',
    content: sys
  },
  SpecGroup.Machine
)

const env_base = `ENV = (v.enter -> VOTER | eo.enter -> EO),
VOTER = (password -> VOTER1),
VOTER1 = (select -> VOTER2),
VOTER2 = (vote -> VOTER3 | back -> VOTER1),
VOTER3 = (confirm -> v.exit -> ENV | back -> VOTER2),
EO = (select -> EO | vote -> EO | confirm -> EO | back -> EO | reset -> EO | eo.exit -> ENV).
`

votingSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'env_base.lts',
    content: env_base
  },
  SpecGroup.Environment
)

const env_dev = `ENV = (v.enter -> VOTER | eo.enter -> EO),
VOTER = (password -> VOTER | select -> VOTER | vote -> VOTER | confirm -> VOTER | back -> VOTER | v.exit -> ENV),
EO = (select -> EO | vote -> eo.vote -> EO | confirm -> EO | back -> EO | reset -> EO | eo.exit -> ENV).
`

votingSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'env_dev.lts',
    content: env_dev
  },
  SpecGroup.Environment
)

const p = `const NoBody = 0
const Voter = 1
const EO = 2
range WHO = NoBody..EO

P = VOTE[NoBody][NoBody][NoBody],
VOTE[in:WHO][sel:WHO][v:WHO] = (
      v.enter -> VOTE[Voter][sel][v] | eo.enter -> VOTE[EO][sel][v]
    | password -> VOTE[in][sel][in]
    | select -> VOTE[in][in][v]
    | when (sel == v) confirm -> VOTE[in][NoBody][NoBody]
).
`

votingSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'p.lts',
    content: p
  },
  SpecGroup.Property
)

const p_w = `fluent InVoting= <password, {confirm, reset}>
fluent VoterIn = <v.enter, v.exit>
fluent OfficialIn = <eo.enter, eo.exit>
fluent CriticalOp = <{select, vote, confirm}, {password, back, reset, eo.enter, eo.exit, v.enter, v.exit}>

assert SELECT_VOTE_BY_VOTER = [](OfficialIn -> (!InVoting || !CriticalOp))

`

votingSpecStore.addSpec(
  {
    type: SpecType.FLTL,
    name: 'p_w.lts',
    content: p_w
  },
  SpecGroup.Property
)

const p_s = `fluent InVoting= <password, {confirm, reset}>
fluent VoterIn = <v.enter, v.exit>
fluent OfficialIn = <eo.enter, eo.exit>
fluent CriticalOp = <{select, vote, confirm}, {password, back, reset, eo.enter, eo.exit, v.enter, v.exit}>

assert SELECT_VOTE_BY_VOTER = [](OfficialIn -> !InVoting)
`

votingSpecStore.addSpec(
  {
    type: SpecType.FLTL,
    name: 'p_s.lts',
    content: p_s
  },
  SpecGroup.Property
)

export const votingRobustnessConfig = {
  sys: 'sys.lts',
  sys2: '',
  env: 'env_base.lts',
  prop: 'p.lts',
  prop2: '',
  dev: '',
  mode: RobustnessMode.Robustness,
  minimized: true,
  expand: false,
  withDisables: false,
  results: ''
}

export const votingRobustifyConfig = {
  sys: 'sys.lts',
  env: 'env_dev.lts',
  prop: 'p.lts',
  progress: 'confirm',
  preferredBeh: {
    P0: '',
    P1: '',
    P2: 'select, vote, back, back, select, vote, confirm',
    P3: 'select, vote, confirm;\nselect, back, select, vote, confirm'
  },
  controllable: {
    P0: '',
    P1: 'password, select, vote, confirm, back, reset',
    P2: '',
    P3: 'eo.enter, eo.exit, v.enter, v.exit'
  },
  observable: {
    P0: 'password, select, vote, confirm, back, reset',
    P1: '',
    P2: 'eo.enter, eo.exit, v.enter, v.exit',
    P3: ''
  },
  algorithm: Algorithm.Fast,
  maxIter: 1,
  solutions: []
}

export const votingWeakeningConfig = {
  sys: 'sys.lts',
  env: 'env_dev.lts',
  prop: 'p_s.lts',
  mode: WeakeningMode.Trace,
  progress: '',
  trace: 'v.enter, password, select, vote, v.exit, eo.enter, reset, eo.exit',
  inputs: '',
  exampleTraces: [],
  exampleTracesPositive: [],
  solutions: '',
  maxNumOfNode: 10
}
