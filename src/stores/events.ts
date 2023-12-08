import { reactive } from 'vue'

export interface EventEmitter {
  reloadSelectedTrigger: boolean
}

export const eventEmitter: EventEmitter = reactive({
  reloadSelectedTrigger: false
})
