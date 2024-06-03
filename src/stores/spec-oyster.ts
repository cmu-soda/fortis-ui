import { Algorithm } from '@/api/robustify'
import { RobustnessMode } from '@/api/robustness'
import { SimpleSpecStore, SpecGroup, SpecType, type SpecStore } from './specs'
import { WeakeningMode } from './weakening-config'

export const oysterSpecStore: SpecStore = new SimpleSpecStore()

const gate_in = `GATE_IN = (snd.oyster -> OYSTER | snd.card -> CARD),
OYSTER = (rcv.oyster.gin -> GATE_IN | snd.oyster -> OYSTER | snd.card -> ANY),
CARD = (rcv.card.gin -> GATE_IN | snd.card -> CARD | snd.oyster -> ANY),
ANY = (rcv.oyster.gin -> OYSTER | rcv.card.gin -> CARD | snd.card -> ANY | snd.oyster -> ANY).`

oysterSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'gate_in.lts',
    content: gate_in
  },
  SpecGroup.Machine
)

const gate_out = `GATE_OUT = (snd.oyster.gin -> OYSTER | snd.card.gin -> CARD),
OYSTER = (rcv.oyster.fin -> GATE_OUT | snd.oyster.gin -> OYSTER | snd.card.gin -> ANY),
CARD = (rcv.card.fin -> GATE_OUT | snd.card.gin -> CARD | snd.oyster.gin -> ANY),
ANY = (rcv.oyster.fin -> OYSTER | rcv.card.fin -> CARD | snd.card.gin -> ANY | snd.oyster.gin -> ANY).`

oysterSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'gate_out.lts',
    content: gate_out
  },
  SpecGroup.Machine
)

const card_bal = `const MAX_BAL = 1

CARD_BAL = CARD_BAL[MAX_BAL],
CARD_BAL[b:0..MAX_BAL] = (
    when (b < MAX_BAL) rld.card[c:1..(MAX_BAL-b)] -> CARD_BAL[b+c]
    |
    when (b > 0) rcv.card.fin -> CARD_BAL[b-1]
).`

oysterSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'card_bal.lts',
    content: card_bal
  },
  SpecGroup.Machine
)

const oyster_bal = `const MAX_BAL = 1

OYSTER_BAL = OYSTER_BAL[MAX_BAL],
OYSTER_BAL[b:0..MAX_BAL] = (
    when (b < MAX_BAL) rld.oyster[c:1..(MAX_BAL-b)] -> OYSTER_BAL[b+c]
    |
    when (b > 0) rcv.oyster.fin -> OYSTER_BAL[b-1]
    |
    when (b == 0) snd.oyster.gin -> no_oyster_bal -> OYSTER_BAL[b]
    |
    when (b > 0) snd.oyster.gin -> OYSTER_BAL[b]
).`

oysterSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'oyster_bal.lts',
    content: oyster_bal
  },
  SpecGroup.Machine
)

const env_base = `E = (snd.oyster -> rcv.oyster.gin -> E1 | snd.card -> rcv.card.gin -> E2),
E1 = (snd.oyster.gin -> E1 | rcv.oyster.fin -> E),
E2 = (snd.card.gin -> E2 | rcv.card.fin -> E).
`

oysterSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'env_base.lts',
    content: env_base
  },
  SpecGroup.Environment
)

const env_dev = `E = (snd.oyster -> rcv.oyster.gin -> E1 | snd.card -> rcv.card.gin -> E2),
E1 = (snd.oyster.gin -> E1 | rcv.oyster.fin -> E | fg -> E3),
E3 = (snd.card.gin -> E3 | rcv.card.fin -> E | rmb -> E1),
E2 = (snd.card.gin -> E2 | rcv.card.fin -> E | fg -> E4),
E4 = (snd.oyster.gin -> E4 | rcv.oyster.fin -> E | rmb -> E2).
`

oysterSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'env_dev.lts',
    content: env_dev
  },
  SpecGroup.Environment
)

const p = `P = (rcv.oyster.gin -> rcv.oyster.fin -> P | rcv.card.gin -> rcv.card.fin -> P).`

oysterSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'p.lts',
    content: p
  },
  SpecGroup.Property
)

const p_w = `fluent UseCard = <rcv.card.gin, rcv.card.fin>
fluent UseOyster = <rcv.oyster.gin, rcv.oyster.fin>
fluent CardOut = <rcv.card.fin, {snd.card, snd.oyster}>
fluent OysterOut = <rcv.oyster.fin, {snd.card, snd.oyster}>
fluent NoOysterBal = <no_oyster_bal, rld.oyster[1]>

assert NO_COLLISION = [](CardOut -> !UseOyster || NoOysterBal) && [](OysterOut -> !UseCard)`

oysterSpecStore.addSpec(
  {
    type: SpecType.FLTL,
    name: 'p_w.lts',
    content: p_w
  },
  SpecGroup.Property
)

const p_s = `fluent UseCard = <rcv.card.gin, rcv.card.fin>
fluent UseOyster = <rcv.oyster.gin, rcv.oyster.fin>
fluent CardOut = <rcv.card.fin, {snd.card, snd.oyster}>
fluent OysterOut = <rcv.oyster.fin, {snd.card, snd.oyster}>
fluent NoOysterBal = <no_oyster_bal, rld.oyster[1]>

assert NO_COLLISION = [](CardOut -> !UseOyster) && [](OysterOut -> !UseCard)`

oysterSpecStore.addSpec(
  {
    type: SpecType.FLTL,
    name: 'p_s.lts',
    content: p_s
  },
  SpecGroup.Property
)

export const oysterRobustnessConfig = {
  sys: 'gate_in.lts, gate_out.lts, card_bal.lts, oyster_bal.lts',
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

export const oysterRobustifyConfig = {
  sys: 'gate_in.lts, gate_out.lts, card_bal.lts, oyster_bal.lts',
  env: 'env_dev.lts',
  prop: 'p.lts',
  progress: 'rcv.oyster.fin, rcv.card.fin',
  preferredBeh: {
    P0: '',
    P1: 'snd.oyster.gin, rcv.oyster.fin, snd.oyster.gin, no_oyster_bal, snd.card.gin, rcv.card.fin, +{snd.card, rld.oyster.1, rld.card.1}',
    P2: '',
    P3: 'snd.oyster, snd.card.gin, snd.oyster.gin, rcv.oyster.fin;\nsnd.card, snd.oyster.gin, snd.card.gin, rcv.card.fin'
  },
  controllable: {
    P0: 'rcv.oyster.gin, rcv.card.gin, rcv.oyster.fin, rcv.card.fin, rld.card.1, rld.oyster.1',
    P1: '',
    P2: '',
    P3: 'snd.oyster, snd.card, snd.oyster.gin, snd.card.gin'
  },
  observable: {
    P0: 'snd.oyster, snd.card, rcv.oyster.gin, rcv.card.gin, snd.oyster.gin, snd.card.gin, rcv.oyster.fin, rcv.card.fin, rld.card.1, rld.oyster.1, no_oyster_bal',
    P1: '',
    P2: '',
    P3: ''
  },
  algorithm: Algorithm.Fast,
  maxIter: 1,
  solutions: []
}

export const oysterWeakeningConfig = {
  sys: 'gate_in.lts, gate_out.lts, card_bal.lts, oyster_bal.lts',
  env: 'env_dev.lts',
  prop: 'p_s.lts',
  mode: WeakeningMode.Trace,
  progress: '',
  trace:
    'snd.oyster.gin, rcv.oyster.fin, snd.oyster.gin, no_oyster_bal, snd.card.gin, rcv.card.fin',
  inputs:
    'snd.oyster.gin, rcv.oyster.fin, no_oyster_bal, snd.card.gin, rcv.card.fin, snd.card, rld.oyster.1, rld.card.1',
  exampleTraces: [],
  exampleTracesPositive: [],
  solutions: '',
  maxNumOfNode: 10
}
