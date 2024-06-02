<script setup lang="ts">
import { ref } from 'vue'
import { WeakeningMode } from '@/stores/weakening-config'
import { weakeningConfigStore as config, loggingStore } from '@/stores/default-stores'
import { toSpecJSON, toEvents, toTraces, type SpecJSON } from '@/api/commons'
import { SpecGroup } from '@/stores/specs'
import { weakeningService } from '@/api/weakening'
import RequestAlert from '@/components/RequestAlert.vue'
import type { WeakeningRequestJSON } from '@/api/weakening'

const requestResults = ref('')
const isCompleted = ref(true)
const isSuccess = ref(false)
const showAlert = ref(false)

function resetAlert() {
  loggingStore.clear()

  requestResults.value = ''
  isCompleted.value = false
  isSuccess.value = false
  showAlert.value = false
}

function generateExamples(additional: boolean = false) {
  resetAlert()
  config.solutions = ''

  const sysList = config.sys.split(',').map((s) => s.trim())
  const envList = config.env.split(',').map((s) => s.trim())
  const prop = config.prop.trim()

  let sysSpecs: SpecJSON[], envSpecs: SpecJSON[], propSpecs: SpecJSON[]
  try {
    sysSpecs = toSpecJSON(sysList)
    envSpecs = toSpecJSON(envList)
    propSpecs = toSpecJSON([prop], SpecGroup.Property)
  } catch (error: any) {
    requestResults.value = "Failed to load specs: " + error.toString()
    showAlert.value = isCompleted.value = true
    return
  }

  const fluents = parseFluents(propSpecs[0].content)

  if (config.mode === WeakeningMode.Trace) {
    const responses: Promise<string[][]>[] = []
    const traces = toTraces(config.trace)
    let inputs = toEvents(config.inputs)

    if (inputs.length === 0) {
      const inputsSet = new Set<string>()
      for (let t of traces) {
        for (let e of t) {
          inputsSet.add(e)
        }
      }
      inputs = Array.from(inputsSet)
    }

    for (let t of traces) {
      const requestJSON = {
        sysSpecs,
        envSpecs,
        fluents,
        trace: t,
        inputs,
        numOfAdditionalExamples: additional ? config.exampleTraces.length + 1 : 0
      }
      const response = weakeningService.generateExamplesFromTrace(requestJSON)
      responses.push(response as Promise<string[][]>)
    }
    setTimeout(() => handleExampleResponse(responses), 500)
  }
}

function parseFluents(prop: string): string[] {
  const fluents: string[] = []
  const regex = /fluent\s+[a-zA-Z0-9_]+\s*=\s*.+/g
  for (let f of prop.matchAll(regex)) {
    fluents.push(f[0])
  }
  return fluents
}

function handleExampleResponse(responses: Promise<string[][]>[]) {
  Promise.all(responses)
    .then((examples) => {
      config.exampleTraces = examples.flatMap((e) => e.map((t) => t.join(', ')))
      config.exampleTracesPositive = examples.map(() => false)
      isSuccess.value = true
      requestResults.value = 'Successfully generated example traces.'
    })
    .catch((error) => {
      config.exampleTraces = []
      config.exampleTracesPositive = []
      requestResults.value = error.toString()
    })
    .finally(() => {
      showAlert.value = isCompleted.value = true
    })
}

function simpleWeaken() {
  resetAlert()
  config.solutions = ''

  const requestJSON = parseRequestJSON()
  if (requestJSON === null) return

  const response = weakeningService.weakenSafetyInvariant(requestJSON)
  setTimeout(() => handleWeakeningResponse(response), 500)
}

function gr1Weaken() {
  resetAlert()
  config.solutions = ''

  const requestJSON = parseRequestJSON()
  if (requestJSON === null) return

  requestJSON.maxNumOfNode = config.maxNumOfNode
  const response = weakeningService.weakenGR1SafetyInvariant(requestJSON)
  setTimeout(() => handleWeakeningResponse(response), 500)
}

function nextSolution() {
  resetAlert()
  config.solutions = ''

  const response = weakeningService.nextSolution()
  setTimeout(() => handleWeakeningResponse(response), 500)
}

function parseRequestJSON(): WeakeningRequestJSON | null {
  const prop = config.prop.trim()

  let propSpecs: SpecJSON[]
  try {
    propSpecs = toSpecJSON([prop], SpecGroup.Property)
  } catch (error: any) {
    requestResults.value = "Failed to load specs: " + error.toString()
    showAlert.value = isCompleted.value = true
    return null
  }

  const invariant = parseInvariant(propSpecs[0].content)
  const fluents = parseFluents(propSpecs[0].content)
  const positiveExamples = config.exampleTraces.filter((_, i) => config.exampleTracesPositive[i])
  const negativeExamples = config.exampleTraces.filter((_, i) => !config.exampleTracesPositive[i])

  return {
    invariant,
    fluents,
    positiveExamples: positiveExamples.map(toEvents),
    negativeExamples: negativeExamples.map(toEvents)
  }
}

function parseInvariant(prop: string): string {
  const regex = /assert\s+[a-zA-Z0-9_]+\s*=\s*(\[\].+)/g
  const matched = regex.exec(prop)
  if (matched !== null) {
    return matched[1]
  } else {
    config.solutions = 'Please enter a valid safety property.'
    throw new Error('Invalid safety property.')
  }
}

function handleWeakeningResponse(response: Promise<string>) {
  response
    .then((weakened) => {
      config.solutions = weakened === '' ? 'No solution found' : weakened
      isSuccess.value = true
      requestResults.value = 'Successfully weakened the safety property.'
    })
    .catch((error) => {
      requestResults.value = error.toString()
    })
    .finally(() => {
      showAlert.value = isCompleted.value = true
    })
}
</script>

<template>
  <div class="container-fluid py-2 h-100 overflow-y-scroll" style="padding-bottom: 50vh !important">
    <RequestAlert
      :show="showAlert"
      :success="isSuccess"
      :message="requestResults"
      @close="() => (showAlert = false)"
    />

    <form @submit.prevent="() => generateExamples()">
      <!-- Sys input -->
      <div class="mb-3 row">
        <label for="sysInput" class="col-sm-2 col-form-label">Machine</label>
        <div class="col-sm-10">
          <input
            v-model="config.sys"
            type="text"
            class="form-control"
            id="sysInput"
            placeholder="Enter names separated by ,"
          />
        </div>
      </div>

      <!-- Env input -->
      <div class="mb-3 row">
        <label for="envInput" class="col-sm-2 col-form-label">Environment</label>
        <div class="col-sm-10">
          <input
            v-model="config.env"
            type="text"
            class="form-control"
            id="envInput"
            placeholder="Enter names separated by ,"
          />
        </div>
      </div>

      <!-- Prop input -->
      <div class="mb-3 row">
        <label for="propInput" class="col-sm-2 col-form-label">Property</label>
        <div class="col-sm-10">
          <input
            v-model="config.prop"
            type="text"
            class="form-control"
            id="propInput"
            placeholder="A safety property in FLTL"
          />
        </div>
      </div>

      <!-- Weakening mode option group -->
      <!-- <div class="mb-3 row">
        <label class="col-sm-2 col-form-label d-block">Mode</label>
        <div class="col-sm-10">
          <div class="btn-group" role="group" aria-label="Weakening Modes">
            <input
              v-model="config.mode"
              type="radio"
              class="btn-check"
              id="mode1"
              :value="WeakeningMode.Trace"
            />
            <label class="btn btn-outline-secondary" for="mode1">Trace</label>

            <input
              v-model="config.mode"
              type="radio"
              class="btn-check"
              id="mode2"
              :value="WeakeningMode.Progress"
            />
            <label class="btn btn-outline-secondary" for="mode2">Progress</label>
          </div>
        </div>
      </div> -->

      <!-- Progress Input -->
      <div v-if="config.mode === WeakeningMode.Progress" class="mb-3 row">
        <label for="progressInput" class="col-sm-2 col-form-label">Progress</label>
        <div class="col-sm-10">
          <input
            v-model="config.progress"
            type="text"
            class="form-control"
            id="progressInput"
            placeholder="Enter progress name"
          />
        </div>
      </div>

      <!-- Trace Input -->
      <div v-if="config.mode === WeakeningMode.Trace" class="mb-3 row">
        <label for="traceInput" class="col-sm-2 col-form-label">Trace</label>
        <div class="col-sm-10">
          <textarea
            v-model="config.trace"
            type="text"
            class="form-control"
            id="traceInput"
            placeholder="Enter the observable trace, events separated by ',' and traces separated by ';'"
            rows="1"
          />
        </div>
      </div>

      <!-- Trace alphabet Input -->
      <div v-if="config.mode === WeakeningMode.Trace" class="mb-3 row">
        <label for="traceAlphabetInput" class="col-sm-2 col-form-label">Trace Alphabet</label>
        <div class="col-sm-10">
          <input
            v-model="config.inputs"
            type="text"
            class="form-control"
            id="traceAlphabetInput"
            placeholder="Enter the alphabet of the trace, events separated by ',' Default is all events of the trace."
          />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mb-3 row">
        <div class="col-sm-10 offset-sm-2">
          <button v-if="isCompleted" type="submit" class="btn btn-primary">
            Generate Example Traces
          </button>
          <button v-else type="submit" class="btn btn-primary" disabled>
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>In progress ...</span>
          </button>
          <button
            v-if="isCompleted && config.exampleTraces.length > 0"
            type="button"
            class="btn btn-primary ms-2"
            @click="() => generateExamples(true)"
          >
            More Examples
          </button>
          <button
            v-else-if="config.exampleTraces.length > 0"
            type="submit"
            class="btn btn-primary ms-2"
            disabled
          >
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>In progress ...</span>
          </button>
        </div>
      </div>
    </form>

    <form>
      <!-- Weakening Input -->
      <div class="mb-3 row">
        <label class="col-sm-2 col-form-label">Example Traces</label>
        <div class="col-sm-10">
          <ul class="list-group">
            <li
              v-for="(t, i) of config.exampleTraces"
              :key="i"
              class="list-group-item list-group-item-light d-flex"
            >
              <div class="me-auto">{{ t }}</div>
              <div class="form-check form-check-reverse">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="config.exampleTracesPositive[i]"
                />
                <label class="form-check-label"><strong>Positive</strong></label>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mb-3 row">
        <div class="col-auto offset-sm-2">
          <button
            v-if="isCompleted"
            type="button"
            class="btn btn-primary"
            @click="simpleWeaken"
            :disabled="config.exampleTraces.length === 0"
          >
            Simple Weaken
          </button>
          <button v-else type="button" class="btn btn-primary" disabled>
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>In progress ...</span>
          </button>

          <button
            v-if="isCompleted"
            type="button"
            class="ms-2 btn btn-primary"
            @click="gr1Weaken"
            :disabled="config.exampleTraces.length === 0"
          >
            General Weaken
          </button>
          <button v-else type="button" class="btn btn-primary ms-2" disabled>
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>In progress ...</span>
          </button>

          <button
            v-if="isCompleted"
            type="button"
            class="ms-2 btn btn-primary"
            @click="nextSolution"
            :disabled="
              config.exampleTraces.length === 0 ||
              config.solutions === '' ||
              config.solutions === 'No solution found'
            "
          >
            Next
          </button>
          <button v-else type="button" class="btn btn-primary ms-2" disabled>
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>In progress ...</span>
          </button>
        </div>
        <label for="maxNodeInput" class="col-auto col-form-label">Max Formula Size</label>
        <div class="col-1">
          <input
            v-model="config.maxNumOfNode"
            type="number"
            class="form-control"
            id="maxNodeInput"
            placeholder="Enter a number"
            min="10"
          />
        </div>
      </div>
    </form>

    <!-- Results -->
    <div class="mb-3 row">
      <label for="solutionsTextarea" class="col-sm-2 col-form-label">Solutions</label>
      <div class="col-sm-10">
        <textarea
          v-model="config.solutions"
          class="form-control"
          id="solutionsTextarea"
          rows="2"
          readonly
        ></textarea>
      </div>
    </div>
  </div>
</template>
