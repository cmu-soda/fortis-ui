import { Algorithm } from '@/api/robustify'
import { RobustnessMode } from '@/api/robustness'
import { SimpleSpecStore, SpecGroup, SpecType, type SpecStore } from './specs'
import { WeakeningMode } from './weakening-config'

export const pumpSpecStore: SpecStore = new SimpleSpecStore()

const lines = `//======================
// Constants and Ranges
//======================

//
// States of the pump alarm
//
const AlarmSilenced = 0
const AlarmSounds = 1

range AlarmState = AlarmSilenced .. AlarmSounds

//
// States of the pump settings
//
const ParamsNotSet = 2    // pump parameters not set yet
const ParamsSet    = 3    // pump parameters already set

range ParamsStateT = ParamsNotSet .. ParamsSet

//
// Locked/unlocked states of a line with respect to a pump channel
//
const LineUnlocked = 4  // line not locked into a pump channel 
const LineLocked   = 5  // line locked into a pump channel

range LineLockStateT = LineUnlocked .. LineLocked

//
// Locked/unlocked states of the pump unit
//
const UnitUnlocked = 6  // the keypad of the pump is not locked
const UnitLocked   = 7  // the keypad of the pump is locked

range UnitLockStateT = UnitUnlocked .. UnitLocked

//
//Plugged/unplugged states of the pump unit
//

const Unplugged = 8 //the pump is not plugged in
const Plugged = 9 //the pump is plugged in 

range PluggedState = Unplugged .. Plugged 

//
//Battery states of the pump unit
//

const BatteryCharge = 12 //the battery has charge
const BatteryLow = 11
const BatteryEmpty = 10 //battery has no charge

range BatteryState = BatteryEmpty .. BatteryCharge

//
//System State
//

const SystemOff = 13
const SystemOn = 14

range SystemState = SystemOff .. SystemOn

//
// Dispense complete
//

const Dispensing = 15
const DispenseDone = 16

range DispenseState = Dispensing .. DispenseDone

//=====================
// Process Definitions
//=====================
range NUM_LINE = 1..1

LINE = LINE[LineUnlocked],

LINE[lineLock:LineLockStateT] = (turn_on -> LINESETUP[ParamsNotSet][lineLock]), 

//
//-Setupmode for the line

LINESETUP[params:ParamsStateT][lineLock:LineLockStateT] = 
( 
  turn_off -> LINE[lineLock]
  |
  power_failure -> LINE[lineLock]
  |
  when (params == ParamsNotSet && lineLock == LineUnlocked)
    set_rate -> LINESETUP[ParamsSet][lineLock]
  |
  when (params == ParamsSet && lineLock == LineUnlocked)
    clear_rate -> LINESETUP[ParamsNotSet][lineLock]
  |
  when (params == ParamsSet && lineLock == LineUnlocked)
    lock_line -> LINESETUP[params][LineLocked]
  |
  when (lineLock == LineLocked)
    erase_and_unlock_line -> LINESETUP[params][LineUnlocked]
  |
  when (params == ParamsSet && lineLock == LineLocked)
    confirm_settings -> LINEINFUSION[UnitUnlocked]
),

//
// Pump in infusion mode:
// - Always be able to turn the unit off, even if locked
// - Allow the user to lock/unlock the unit
// - Errors could occur with the pump (e.g., line became pinched or plugged)
//
LINEINFUSION[unitLock:UnitLockStateT] =
(
  turn_off -> LINE[LineLocked]
  |
  power_failure -> LINE[LineLocked]
  |
  when (unitLock == UnitUnlocked)
    change_settings -> LINESETUP[ParamsSet][LineLocked]
  |
  when (unitLock == UnitUnlocked)
    lock_unit -> LINEINFUSION[UnitLocked]
  |
  when (unitLock == UnitLocked)
    unlock_unit -> LINEINFUSION[UnitUnlocked]
  |
  when (unitLock == UnitLocked)
    start_dispense -> DISPENSE[SystemOn][Dispensing]
),

DISPENSE[system_state:SystemState][dispense:DispenseState] =
(
  dispense_main_med_flow -> DISPENSE[system_state][DispenseDone]
  |
  when (system_state == SystemOn && dispense == DispenseDone)
    flow_complete -> unlock_unit -> LINESETUP[ParamsNotSet][LineLocked]
  |
  power_failure -> DISPENSE[SystemOff][Dispensing]
  |
  when (system_state == SystemOff)
    turn_on -> LINESETUP[ParamsNotSet][LineLocked]
  |
  when (system_state == SystemOn)
    turn_off -> LINE[LineLocked]
).

||LINES = (line[NUM_LINE]:LINE)/{
  turn_on/line[NUM_LINE].turn_on,
  turn_off/line[NUM_LINE].turn_off,
  power_failure/line[NUM_LINE].power_failure}.
`

pumpSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'lines.lts',
    content: lines
  },
  SpecGroup.Machine
)

const alarm = `//======================
// Constants and Ranges
//======================

//
// States of the pump alarm
//
const AlarmSilenced = 0
const AlarmSounds = 1

range AlarmState = AlarmSilenced .. AlarmSounds

//
// States of the pump settings
//
const ParamsNotSet = 2    // pump parameters not set yet
const ParamsSet    = 3    // pump parameters already set

range ParamsStateT = ParamsNotSet .. ParamsSet

//
// Locked/unlocked states of a line with respect to a pump channel
//
const LineUnlocked = 4  // line not locked into a pump channel 
const LineLocked   = 5  // line locked into a pump channel

range LineLockStateT = LineUnlocked .. LineLocked

//
// Locked/unlocked states of the pump unit
//
const UnitUnlocked = 6  // the keypad of the pump is not locked
const UnitLocked   = 7  // the keypad of the pump is locked

range UnitLockStateT = UnitUnlocked .. UnitLocked

//
//Plugged/unplugged states of the pump unit
//

const Unplugged = 8 //the pump is not plugged in
const Plugged = 9 //the pump is plugged in 

range PluggedState = Unplugged .. Plugged 

//
//Battery states of the pump unit
//

const BatteryCharge = 12 //the battery has charge
const BatteryLow = 11
const BatteryEmpty = 10 //battery has no charge

range BatteryState = BatteryEmpty .. BatteryCharge

//
//System State
//

const SystemOff = 13
const SystemOn = 14

range SystemState = SystemOff .. SystemOn

//=====================
// Process Definitions
//=====================

ALARM = ALARM[AlarmSilenced],
ALARM[alarm_state:AlarmState] =
(
  when (alarm_state == AlarmSounds)
    alarm_rings -> ALARM[alarm_state]
  |
  when (alarm_state == AlarmSounds)
    alarm_silence -> ALARM[AlarmSilenced]
  |
  enable_alarm -> ALARM[AlarmSounds]
  |
  power_failure -> ALARM
).
`

pumpSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'alarm.lts',
    content: alarm
  },
  SpecGroup.Machine
)

const power = `//======================
// Constants and Ranges
//======================

//
// States of the pump alarm
//
const AlarmSilenced = 0
const AlarmSounds = 1

range AlarmState = AlarmSilenced .. AlarmSounds

//
// States of the pump settings
//
const ParamsNotSet = 2    // pump parameters not set yet
const ParamsSet    = 3    // pump parameters already set

range ParamsStateT = ParamsNotSet .. ParamsSet

//
// Locked/unlocked states of a line with respect to a pump channel
//
const LineUnlocked = 4  // line not locked into a pump channel 
const LineLocked   = 5  // line locked into a pump channel

range LineLockStateT = LineUnlocked .. LineLocked

//
// Locked/unlocked states of the pump unit
//
const UnitUnlocked = 6  // the keypad of the pump is not locked
const UnitLocked   = 7  // the keypad of the pump is locked

range UnitLockStateT = UnitUnlocked .. UnitLocked

//
//Plugged/unplugged states of the pump unit
//

const Unplugged = 8 //the pump is not plugged in
const Plugged = 9 //the pump is plugged in 

range PluggedState = Unplugged .. Plugged 

//
//Battery states of the pump unit
//

const BatteryCharge = 12 //the battery has charge
const BatteryLow = 11
const BatteryEmpty = 10 //battery has no charge

range BatteryState = BatteryEmpty .. BatteryCharge

//
//System State
//

const SystemOff = 13
const SystemOn = 14

range SystemState = SystemOff .. SystemOn

//=====================
// Process Definitions
//=====================

//Initial Pump State
PUMP_POWER = POWERED[Unplugged][BatteryEmpty],

//Pump has power but not on -- keep track of whether there is any battery and plug state
POWERED[plug_state:PluggedState][battery_state:BatteryState]  = 
(
  when (plug_state == Unplugged) 
    plug_in -> POWERED[Plugged][battery_state]
  |
  when (plug_state == Plugged)
    unplug -> POWERED[Unplugged][battery_state]
  |
  when (battery_state != BatteryEmpty)
    turn_on -> POWER_ON[plug_state][battery_state]
  |
  when (plug_state == Plugged && battery_state != BatteryCharge)
    battery_charge -> POWERED[plug_state][battery_state+1]
),

//Pump is on
POWER_ON[plug_state:PluggedState][battery_state:BatteryState] = 
(
  when (plug_state == Plugged)
    unplug -> POWER_ON[Unplugged][battery_state]
  |
  when (plug_state == Unplugged)
    plug_in -> POWER_ON[Plugged][battery_state]
  |
  turn_off -> POWERED[plug_state][battery_state]
  |
  when (plug_state == Unplugged && battery_state == BatteryCharge)
    battery_spent -> POWER_ON[plug_state][BatteryLow]
  |
  when (plug_state == Unplugged && battery_state == BatteryLow)
    power_failure -> POWERED[Unplugged][BatteryEmpty]
  |
  when (plug_state == Plugged && battery_state != BatteryCharge)
    battery_charge -> POWER_ON[plug_state][battery_state+1]
  |
  when (plug_state == Unplugged && battery_state == BatteryLow)
    enable_alarm -> POWER_ON[plug_state][battery_state]
).
`

pumpSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'power.lts',
    content: power
  },
  SpecGroup.Machine
)

const env_base = `range LINES = 1..1

//
// Set of actions that the user of the LTSA tool can control in an
// animation of this model.
//
menu UserControlMenu = {
  alarm_silence,

  line[LINES].change_settings,
  line[LINES].clear_rate,
  line[LINES].confirm_settings,
  line[LINES].erase_and_unlock_line,
  line[LINES].lock_line,
  line[LINES].lock_unit,
  line[LINES].set_rate,
  line[LINES].unlock_unit,

  plug_in,
  turn_off,
  turn_on,
  unplug
}

ENV = (plug_in -> turn_on -> CHOOSE),
CHOOSE = (line[i:LINES].set_rate -> RUN[i] | turn_off -> unplug -> ENV),
RUN[i:LINES] = (
    line[i].lock_line -> line[i].confirm_settings -> line[i].lock_unit -> line[i].start_dispense ->
    line[i].unlock_unit -> line[i].erase_and_unlock_line -> CHOOSE
)+{line[LINES].clear_rate, line[LINES].change_settings}.
`

pumpSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'env_base.lts',
    content: env_base
  },
  SpecGroup.Environment
)

const env_dev = `range LINES = 1..1

//
// Set of actions that the user of the LTSA tool can control in an
// animation of this model.
//
menu UserControlMenu = {
  alarm_silence,

  line[LINES].change_settings,
  line[LINES].clear_rate,
  line[LINES].confirm_settings,
  line[LINES].erase_and_unlock_line,
  line[LINES].lock_line,
  line[LINES].lock_unit,
  line[LINES].set_rate,
  line[LINES].unlock_unit,

  plug_in,
  turn_off,
  turn_on,
  unplug
}

ENV = (
  alarm_silence -> ENV |

  line[LINES].change_settings -> ENV |
  line[LINES].clear_rate -> ENV |
  line[LINES].confirm_settings -> ENV |
  line[LINES].erase_and_unlock_line -> ENV |
  line[LINES].lock_line -> ENV |
  line[LINES].lock_unit -> ENV |
  line[LINES].set_rate -> ENV |
  line[LINES].unlock_unit -> ENV |

  plug_in -> ENV |
  turn_off -> ENV |
  turn_on -> ENV |
  unplug -> ENV
)+{unplug}.
`

pumpSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'env_dev.lts',
    content: env_dev
  },
  SpecGroup.Environment
)

const p = `P = (line[1].set_rate -> RATE_SET | power_failure -> P),
RATE_SET = (line[1].set_rate -> RATE_SET | power_failure -> P | line[1].dispense_main_med_flow -> DISPENSE),
DISPENSE = (line[1].dispense_main_med_flow -> DISPENSE | line[1].flow_complete -> P | power_failure -> P).`

pumpSpecStore.addSpec(
  {
    type: SpecType.FSP,
    name: 'p.lts',
    content: p
  },
  SpecGroup.Property
)

const p_w = `fluent Dispensing = <line[1].dispense_main_med_flow, {alarm_rings, alarm_silence, battery_charge, battery_spent, enable_alarm, line[1].change_settings, line[1].clear_rate, line[1].confirm_settings, line[1].erase_and_unlock_line, line[1].flow_complete, line[1].lock_line, line[1].lock_unit, line[1].set_rate, line[1].start_dispense, line[1].unlock_unit, plug_in, power_failure, turn_off, turn_on, unplug}>
fluent PowerFailed = <power_failure, battery_charge>
fluent Plugged = <plug_in, unplug>

assert SAFE_DISPENSE = [](Dispensing -> Plugged || !PowerFailed)`

pumpSpecStore.addSpec(
  {
    type: SpecType.FLTL,
    name: 'p_w.lts',
    content: p_w
  },
  SpecGroup.Property
)

const p_s = `fluent Dispensing = <line[1].dispense_main_med_flow, {alarm_rings, alarm_silence, battery_charge, battery_spent, enable_alarm, line[1].change_settings, line[1].clear_rate, line[1].confirm_settings, line[1].erase_and_unlock_line, line[1].flow_complete, line[1].lock_line, line[1].lock_unit, line[1].set_rate, line[1].start_dispense, line[1].unlock_unit, plug_in, power_failure, turn_off, turn_on, unplug}>
fluent PowerFailed = <power_failure, battery_charge>
fluent Plugged = <plug_in, unplug>

assert SAFE_DISPENSE = [](Dispensing -> Plugged)`

pumpSpecStore.addSpec(
  {
    type: SpecType.FLTL,
    name: 'p_s.lts',
    content: p_s
  },
  SpecGroup.Property
)

export const pumpRobustnessConfig = {
  sys: 'lines.lts, alarm.lts, power.lts',
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

export const pumpRobustifyConfig = {
  sys: 'lines.lts',
  env: 'env_dev.lts, alarm.lts, power.lts',
  prop: 'p.lts',
  progress: 'line.1.flow_complete',
  preferredBeh: {
    P0: '',
    P1: '',
    P2: '',
    P3: 'turn_on, line.1.start_dispense, line.1.dispense_main_med_flow, line.1.dispense_main_med_flow, power_failure, turn_on, line.1.start_dispense, line.1.dispense_main_med_flow, line.1.flow_complete, turn_off;\n\nturn_on, line.1.dispense_main_med_flow, line.1.flow_complete, turn_off'
  },
  controllable: {
    P0: 'line.1.change_settings, line.1.clear_rate, line.1.confirm_settings, line.1.dispense_main_med_flow, line.1.flow_complete, line.1.set_rate, line.1.start_dispense',
    P1: '',
    P2: 'line.1.erase_and_unlock_line, line.1.lock_line, line.1.lock_unit, line.1.unlock_unit, turn_off, turn_on',
    P3: 'plug_in, unplug'
  },
  observable: {
    P0: 'line.1.change_settings, line.1.clear_rate, line.1.confirm_settings, line.1.dispense_main_med_flow, line.1.erase_and_unlock_line, line.1.flow_complete, line.1.lock_line, line.1.lock_unit, line.1.set_rate, line.1.start_dispense, line.1.unlock_unit, turn_off, turn_on',
    P1: '',
    P2: '',
    P3: 'battery_charge, battery_spent, plug_in, unplug'
  },
  algorithm: Algorithm.Fast,
  maxIter: 1,
  solutions: []
}

export const pumpWeakeningConfig = {
  sys: 'lines.lts',
  env: 'env_dev.lts, alarm.lts, power.lts',
  prop: 'p_s.lts',
  mode: WeakeningMode.Trace,
  progress: '',
  trace:
    'plug_in, turn_on, line.1.start_dispense, line.1.dispense_main_med_flow, unplug, line.1.dispense_main_med_flow, plug_in, line.1.dispense_main_med_flow, line.1.flow_complete, turn_off',
  inputs: '',
  exampleTraces: [],
  exampleTracesPositive: [],
  solutions: '',
  maxNumOfNode: 10
}
