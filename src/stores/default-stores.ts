import { reactive } from 'vue'
import { SimpleSpecStore, type SpecStore } from './specs'
import { mockSpecStore } from './specs-mock'

export const specStore: SpecStore = reactive(mockSpecStore)
