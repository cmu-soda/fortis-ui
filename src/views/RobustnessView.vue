<script setup lang="ts">
import { ref } from 'vue'
import { RobustnessMode, type EquivClass, type SpecJSON, robustnessService } from '@/api/robustness'
import { specStore } from '@/stores/default-stores'
import { SpecGroup } from '@/stores/specs'

const sys = ref('')
const sys2 = ref('')
const env = ref('')
const prop = ref('')
const prop2 = ref('')
const dev = ref('')
const selectedRobustness = ref(RobustnessMode.Robustness)
const minimized = ref(false)
const expand = ref(false)
const withDisables = ref(false)

const requestResults = ref('')

function toSpecJSON(names: string[], group: SpecGroup): SpecJSON[] | undefined {
  let specJSON = names
    .map((name) => specStore.getSpec(name, group))
    .filter((s) => s !== undefined)
    .map((spec) => ({ type: spec!.type, content: spec!.content }))
  if (specJSON.length === 0) {
    return undefined
  }
  return specJSON
}

function submitForm() {
  const sysList = sys.value.split(';').map((s) => s.trim())
  const sys2List = sys2.value.split(';').map((s) => s.trim())
  const envList = env.value.split(';').map((s) => s.trim())
  const propList = prop.value.split(';').map((s) => s.trim())
  const prop2List = prop2.value.split(';').map((s) => s.trim())
  const devList = dev.value.split(';').map((s) => s.trim())

  const sysSpecs = toSpecJSON(sysList, SpecGroup.System)
  const envSpecs = toSpecJSON(envList, SpecGroup.Environment)
  const propSpecs = toSpecJSON(propList, SpecGroup.Property)

  if (sysSpecs === undefined || envSpecs === undefined || propSpecs === undefined) {
    requestResults.value = 'Please enter at least one valid system, environment, and property.'
    return
  }

  const requestJSON = {
    sysSpecs,
    envSpecs,
    propSpecs,

    sys2Specs: toSpecJSON(sys2List, SpecGroup.System),
    prop2Specs: toSpecJSON(prop2List, SpecGroup.Property),
    devSpecs: toSpecJSON(devList, SpecGroup.Environment),

    options: {
      expand: expand.value,
      minimized: minimized.value,
      disables: withDisables.value
    }
  }

  let response: Promise<EquivClass[] | string>
  switch (selectedRobustness.value) {
    case RobustnessMode.Robustness:
      response = robustnessService.computeRobustness(requestJSON)
      handleEquivClassResponse(response as Promise<EquivClass[]>)
      break
    case RobustnessMode.Intolerable:
      response = robustnessService.computeIntolerable(requestJSON)
      handleEquivClassResponse(response as Promise<EquivClass[]>)
      break
    case RobustnessMode.CompareSys:
      response = robustnessService.compareRobustnessOfTwoSystems(requestJSON)
      handleEquivClassResponse(response as Promise<EquivClass[]>)
      break
    case RobustnessMode.CompareProp:
      response = robustnessService.compareRobustnessOfTwoProps(requestJSON)
      handleEquivClassResponse(response as Promise<EquivClass[]>)
      break
    case RobustnessMode.WA:
      response = robustnessService.computeWA(requestJSON)
      handleStringResponse(response as Promise<string>)
      break
  }
}

function handleEquivClassResponse(response: Promise<EquivClass[]>) {
  response
    .then((data) => {
      // Handle the response data
      let resultString = ''
      for (let i = 0; i < data.length; i++) {
        const equivClass = data[i]
        resultString += `Equiv Class ${i + 1}:\n`
        for (const rep of equivClass) {
          resultString += `  ${rep.rep.word}${rep.rep.deadlock ? ' (deadlock)' : ''} => ${
            rep.explanation
          }\n`
        }
        // resultString += '\n';
      }
      if (resultString === '') {
        resultString = 'No deviations found.'
      }
      requestResults.value = resultString
    })
    .catch((error) => {
      console.error('Error:', error)
      requestResults.value = 'An error occurred while processing the request.'
    })
}

function handleStringResponse(response: Promise<string>) {
  response
    .then((data) => {
      // Handle the response data
      requestResults.value = data
    })
    .catch((error) => {
      console.error('Error:', error)
      requestResults.value = 'An error occurred while processing the request.'
    })
}
</script>

<template>
  <div class="container-fluid py-2 h-100 overflow-y-scroll">
    <form @submit.prevent="submitForm">
      <!-- Sys Input -->
      <div class="mb-3 row">
        <label for="sysInput" class="col-sm-3 col-form-label">System</label>
        <div class="col-sm-9">
          <input
            v-model="sys"
            type="text"
            class="form-control"
            id="sysInput"
            placeholder="Enter names separated by ;"
          />
        </div>
      </div>

      <!-- Sys2 Input -->
      <div v-if="selectedRobustness === RobustnessMode.CompareSys" class="mb-3 row">
        <label for="sysInput2" class="col-sm-3 col-form-label">System to compare</label>
        <div class="col-sm-9">
          <input
            v-model="sys2"
            type="text"
            class="form-control"
            id="sysInput2"
            placeholder="Enter names separated by ;"
          />
        </div>
      </div>

      <!-- Env Input -->
      <div class="mb-3 row">
        <label for="envInput" class="col-sm-3 col-form-label">Environment</label>
        <div class="col-sm-9">
          <input
            v-model="env"
            type="text"
            class="form-control"
            id="envInput"
            placeholder="Enter names separated by ;"
          />
        </div>
      </div>

      <!-- Prop Input -->
      <div class="mb-3 row">
        <label for="propInput" class="col-sm-3 col-form-label">Property</label>
        <div class="col-sm-9">
          <input
            v-model="prop"
            type="text"
            class="form-control"
            id="propInput"
            placeholder="Enter names separated by ;"
          />
        </div>
      </div>

      <!-- Prop2 Input -->
      <div v-if="selectedRobustness === RobustnessMode.CompareProp" class="mb-3 row">
        <label for="propInput2" class="col-sm-3 col-form-label">Property to compare</label>
        <div class="col-sm-9">
          <input
            v-model="prop"
            type="text"
            class="form-control"
            id="propInput2"
            placeholder="Enter names separated by ;"
          />
        </div>
      </div>

      <!-- Dev Input -->
      <div class="mb-3 row">
        <label for="devInput" class="col-sm-3 col-form-label">Explanation Model</label>
        <div class="col-sm-9">
          <input
            v-model="dev"
            type="text"
            class="form-control"
            id="devInput"
            placeholder="Enter names separated by ;"
          />
        </div>
      </div>

      <!-- Robustness Group -->
      <div class="mb-3 row">
        <label class="col-sm-3 col-form-label d-block">Robustness</label>
        <div class="col-sm-9">
          <div class="btn-group" role="group" aria-label="Robustness Modes">
            <input
              v-model="selectedRobustness"
              type="radio"
              class="btn-check"
              id="robustness1"
              :value="RobustnessMode.Robustness"
            />
            <label class="btn btn-outline-secondary" for="robustness1">Robustness</label>

            <input
              v-model="selectedRobustness"
              type="radio"
              class="btn-check"
              id="robustness2"
              :value="RobustnessMode.Intolerable"
            />
            <label class="btn btn-outline-secondary" for="robustness2">Intolerable</label>

            <input
              v-model="selectedRobustness"
              type="radio"
              class="btn-check"
              id="robustness3"
              :value="RobustnessMode.CompareSys"
            />
            <label class="btn btn-outline-secondary" for="robustness3">Compare Systems</label>

            <input
              v-model="selectedRobustness"
              type="radio"
              class="btn-check"
              id="robustness4"
              :value="RobustnessMode.CompareProp"
            />
            <label class="btn btn-outline-secondary" for="robustness4">Compare Properties</label>

            <input
              v-model="selectedRobustness"
              type="radio"
              class="btn-check"
              id="robustness5"
              :value="RobustnessMode.WA"
            />
            <label class="btn btn-outline-secondary" for="robustness5">WA Only</label>
          </div>
        </div>
      </div>

      <!-- Options Group -->
      <div class="mb-3 row">
        <label class="col-sm-3 col-form-label d-block">Options</label>
        <div class="col-sm-9">
          <div class="btn-group" role="group" aria-label="Options">
            <input v-model="minimized" type="checkbox" class="btn-check" id="option1" />
            <label class="btn btn-outline-secondary" for="option1">Minimized</label>

            <input v-model="expand" type="checkbox" class="btn-check" id="option2" />
            <label class="btn btn-outline-secondary" for="option2">Expand</label>

            <input v-model="withDisables" type="checkbox" class="btn-check" id="option3" />
            <label class="btn btn-outline-secondary" for="option3">With Disables</label>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mb-3 row">
        <div class="col-sm-9 offset-sm-3">
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>
      </div>
    </form>

    <!-- Results Textarea -->
    <div class="mb-3">
      <label for="resultsTextarea" class="form-label">Results</label>
      <textarea
        v-model="requestResults"
        class="form-control"
        id="resultsTextarea"
        rows="20"
        readonly
      ></textarea>
    </div>
  </div>
</template>