<script setup lang="ts">
import { ref } from 'vue'
import { toSpecJSON, toTraces, toEvents, type SpecJSON } from '@/api/commons'
import { SpecGroup } from '@/stores/specs'
import {
  robustificationService,
  Algorithm,
  type RequestJSON,
  type RobustificationResult
} from '@/api/robustify'
import { robustifyConfigStore as config, loggingStore } from '@/stores/default-stores'
import RequestAlert from '@/components/RequestAlert.vue'

const requestResults = ref('')
const isCompleted = ref(true)
const isSuccess = ref(false)
const showAlert = ref(false)

function resetAlert() {
  loggingStore.clear()

  isCompleted.value = false
  isSuccess.value = false
  requestResults.value = ''
  showAlert.value = false

  config.solutions = []
}

function submitForm() {
  resetAlert()

  const sysList = config.sys.split(',').map((s) => s.trim())
  const envList = config.env.split(',').map((s) => s.trim())
  const propList = config.prop.split(',').map((s) => s.trim())

  let sysSpecs: SpecJSON[], envSpecs: SpecJSON[], propSpecs: SpecJSON[]
  try {
    sysSpecs = toSpecJSON(sysList)
    envSpecs = toSpecJSON(envList)
    propSpecs = toSpecJSON(propList, SpecGroup.Property)
  } catch (error: any) {
    requestResults.value = "Failed to load specs, " + error.toString()
    showAlert.value = isCompleted.value = true
    return
  }

  const requestJSON: RequestJSON = {
    sysSpecs,
    envSpecs,
    propSpecs,
    options: {
      progress: config.progress.split(',').map((s) => s.trim()),
      preferredBeh: {
        P3: toTraces(config.preferredBeh.P3),
        P2: toTraces(config.preferredBeh.P2),
        P1: toTraces(config.preferredBeh.P1),
        P0: [] // toTraces(config.preferredBeh.P0)
      },
      controllable: {
        P3: toEvents(config.controllable.P3),
        P2: toEvents(config.controllable.P2),
        P1: toEvents(config.controllable.P1),
        P0: toEvents(config.controllable.P0)
      },
      observable: {
        P3: toEvents(config.observable.P3),
        P2: toEvents(config.observable.P2),
        P1: toEvents(config.observable.P1),
        P0: toEvents(config.observable.P0)
      },
      algorithm: config.algorithm,
      maxIter: config.maxIter
    },
    outputFormat: 'FSP'
  }

  const response = robustificationService.robustify(requestJSON)
  handleResponse(response)
}

function handleResponse(response: Promise<RobustificationResult[]>) {
  response
    .then((data) => {
      config.solutions = data
      isSuccess.value = true
      requestResults.value = 'Robustification process is completed!'
    })
    .catch((error) => {
      config.solutions = []
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

    <form @submit.prevent="submitForm">
      <!-- Sys Input -->
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

      <!-- Env Input -->
      <div class="mb-3 row">
        <label for="envInput" class="col-sm-2 col-form-label">Deviated Environment</label>
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

      <!-- Prop Input -->
      <div class="mb-3 row">
        <label for="propInput" class="col-sm-2 col-form-label">Property</label>
        <div class="col-sm-10">
          <input
            v-model="config.prop"
            type="text"
            class="form-control"
            id="propInput"
            placeholder="Enter names separated by ,"
          />
        </div>
      </div>

      <!-- Progress Input -->
      <div class="mb-3 row">
        <label for="progressInput" class="col-sm-2 col-form-label">Progress</label>
        <div class="col-sm-10">
          <input
            v-model="config.progress"
            type="text"
            class="form-control"
            id="progressInput"
            placeholder="Enter events separated by ,"
          />
        </div>
      </div>

      <!-- Preferred Behaviors Input by Priority -->
      <div class="mb-3 row">
        <label class="col-sm-2 col-form-label">Preferred Behaviors</label>
        <div class="col-sm-10">
          <!-- Must Haves -->
          <!-- <div class="mb-1 row">
            <label for="preferredP0Input" class="col-sm-2 col-form-label">Must-Have</label>
            <div class="col">
              <textarea
                v-model="config.preferredBeh.P0"
                type="text"
                class="form-control"
                id="preferredP0Input"
                placeholder="Enter traces where events in a trace should be separated by ',' and traces should be separated by ';'"
                rows="2"
              />
            </div>
          </div> -->

          <!-- Essential -->
          <div class="mb-1 row">
            <label for="preferredP3Input" class="col-sm-2 col-form-label">Essential</label>
            <div class="col">
              <textarea
                v-model="config.preferredBeh.P3"
                type="text"
                class="form-control"
                id="preferredP3Input"
                placeholder="Enter traces where events in a trace should be separated by ',' and traces should be separated by ';'"
                rows="2"
              />
            </div>
          </div>

          <!-- Important -->
          <div class="mb-1 row">
            <label for="preferredP2Input" class="col-sm-2 col-form-label">Important</label>
            <div class="col">
              <textarea
                v-model="config.preferredBeh.P2"
                type="text"
                class="form-control"
                id="preferredP2Input"
                placeholder="Enter traces where events in a trace should be separated by ',' and traces should be separated by ';'"
                rows="2"
              />
            </div>
          </div>

          <!-- Minor -->
          <div class="mb-1 row">
            <label for="preferredP1Input" class="col-sm-2 col-form-label">Minor</label>
            <div class="col">
              <textarea
                v-model="config.preferredBeh.P1"
                type="text"
                class="form-control"
                id="preferredP1Input"
                placeholder="Enter traces where events in a trace should be separated by ',' and traces should be separated by ';'"
                rows="2"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Controllable Events Input by Priority -->
      <div class="mb-3 row">
        <label class="col-sm-2 col-form-label">Controllable Events</label>
        <div class="col-sm-10">
          <div class="mb-1 row">
            <!-- Costly -->
            <label for="controllableP3Input" class="col-sm-2 col-form-label">Costly</label>
            <div class="col">
              <textarea
                v-model="config.controllable.P3"
                type="text"
                class="form-control"
                id="controllableP3Input"
                placeholder="Enter events separated by ,"
                rows="1"
              />
            </div>
          </div>

          <!-- Moderate -->
          <div class="mb-1 row">
            <label for="controllableP2Input" class="col-sm-2 col-form-label">Moderate</label>
            <div class="col">
              <textarea
                v-model="config.controllable.P2"
                type="text"
                class="form-control"
                id="controllableP2Input"
                placeholder="Enter events separated by ,"
                rows="1"
              />
            </div>
          </div>

          <!-- Cheap -->
          <div class="mb-1 row">
            <label for="controllableP1Input" class="col-sm-2 col-form-label">Cheap</label>
            <div class="col">
              <textarea
                v-model="config.controllable.P1"
                type="text"
                class="form-control"
                id="controllableP1Input"
                placeholder="Enter events separated by ,"
                rows="1"
              />
            </div>
          </div>

          <!-- No Cost -->
          <div class="mb-1 row">
            <label for="controllableP0Input" class="col-sm-2 col-form-label">No Cost</label>
            <div class="col">
              <textarea
                v-model="config.controllable.P0"
                type="text"
                class="form-control"
                id="controllableP0Input"
                placeholder="Enter events separated by ,"
                rows="1"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Observable Events Input by Priority -->
      <div class="mb-3 row">
        <label class="col-sm-2 col-form-label">Observable Events</label>
        <div class="col-sm-10">
          <div class="mb-1 row">
            <!-- Costly -->
            <label for="observableP3Input" class="col-sm-2 col-form-label">Costly</label>
            <div class="col">
              <textarea
                v-model="config.observable.P3"
                type="text"
                class="form-control"
                id="observableP3Input"
                placeholder="Enter events separated by ,"
                rows="1"
              />
            </div>
          </div>

          <!-- Moderate -->
          <div class="mb-1 row">
            <label for="observableP2Input" class="col-sm-2 col-form-label">Moderate</label>
            <div class="col">
              <textarea
                v-model="config.observable.P2"
                type="text"
                class="form-control"
                id="observableP2Input"
                placeholder="Enter events separated by ,"
                rows="1"
              />
            </div>
          </div>

          <!-- Cheap -->
          <div class="mb-1 row">
            <label for="observableP1Input" class="col-sm-2 col-form-label">Cheap</label>
            <div class="col">
              <textarea
                v-model="config.observable.P1"
                type="text"
                class="form-control"
                id="observableP1Input"
                placeholder="Enter events separated by ,"
                rows="1"
              />
            </div>
          </div>

          <!-- No Cost -->
          <div class="mb-1 row">
            <label for="observableP0Input" class="col-sm-2 col-form-label">No Cost</label>
            <div class="col">
              <textarea
                v-model="config.observable.P0"
                type="text"
                class="form-control"
                id="observableP0Input"
                placeholder="Enter events separated by ,"
                rows="1"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Algorithm Options Group -->
      <div class="mb-3 row">
        <label class="col-sm-2 col-form-label d-block">Algorithm</label>
        <div class="col-sm-10">
          <div class="btn-group" role="group" aria-label="Algorithm">
            <input
              v-model="config.algorithm"
              type="radio"
              class="btn-check"
              id="algorithm1"
              :value="Algorithm.Pareto"
            />
            <label class="btn btn-outline-secondary" for="algorithm1">Pareto</label>

            <input
              v-model="config.algorithm"
              type="radio"
              class="btn-check"
              id="algorithm2"
              :value="Algorithm.Fast"
            />
            <label class="btn btn-outline-secondary" for="algorithm2">Fast</label>
          </div>
        </div>
      </div>

      <!-- Max Iter -->
      <div class="mb-3 row">
        <label for="maxIterInput" class="col-sm-2 col-form-label">Max Iterations</label>
        <div class="col-auto">
          <input
            v-model="config.maxIter"
            type="number"
            class="form-control"
            id="maxIterInput"
            placeholder="Enter a number"
            min="1"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mb-3 row">
        <div class="col-sm-10 offset-sm-2">
          <button v-if="isCompleted" type="submit" class="btn btn-primary">Compute</button>
          <button v-else type="submit" class="btn btn-primary" disabled>
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>In progress ...</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Results Textarea -->
    <div class="mb-3">
      <label for="solutions" class="form-label">Solutions</label>
      <!-- A tab list of all the robustification results -->
      <ul class="nav nav-tabs" role="tablist">
        <li v-for="(_, i) of config.solutions" :key="i" class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            :data-bs-target="`#solution-${i}`"
            type="button"
            role="tab"
          >
            Solution {{ i + 1 }}
          </button>
        </li>
      </ul>
      <div class="tab-content">
        <div
          v-for="(s, i) of config.solutions"
          :key="i"
          :id="`solution-${i}`"
          class="tab-pane"
          role="tabpanel"
        >
          <div class="my-2 row">
            <label class="col-sm-2 col-form-label">Model</label>
            <div class="col">
              <textarea :value="s.model" rows="10" class="form-control" readonly />
            </div>
          </div>

          <div class="my-2 row">
            <label class="col-sm-2 col-form-label">Preferred</label>
            <div class="col">
              <textarea
                :value="s.preferred.map((t) => t.join(', ')).join(';\n')"
                class="form-control"
                rows="5"
                readonly
              />
            </div>
          </div>

          <div class="my-2 row">
            <label class="col-sm-2 col-form-label">Controllable w/ cost</label>
            <div class="col">
              <input :value="s.controllable.filter(x => !config.controllable.P0.includes(x)).join(', ')" type="text" class="form-control" readonly />
            </div>
          </div>

          <div class="my-2 row">
            <label class="col-sm-2 col-form-label">Observable w/ cost</label>
            <div class="col">
              <input :value="s.observable.filter(x => !config.observable.P0.includes(x)).join(', ')" type="text" class="form-control" readonly />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="mb-3">
      <label for="resultTextarea" class="form-label">Result</label>
      <textarea
        v-model="requestResults"
        class="form-control"
        id="resultTextarea"
        rows="3"
        readonly
      ></textarea>
    </div> -->
  </div>
</template>
