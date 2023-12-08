<script setup lang="ts">
import { ref } from 'vue'
import { SpecGroup, SpecType } from '@/stores/specs'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconOpen from '@/components/icons/IconOpen.vue'
import IconSave from '@/components/icons/IconSave.vue'
import IconReload from './icons/IconReload.vue'
import { specStore } from '@/stores/default-stores'

const newSpecToggle = ref(false)
const openSpecToggle = ref(false)
const addSpecGroup = ref(SpecGroup.System)
const addSpecName = ref('')
const addSpecType = ref(SpecType.FSP)
const selectedFile = ref<File | undefined>()

function toggleNewSpec() {
  newSpecToggle.value = !newSpecToggle.value
  openSpecToggle.value = false
}

function toggleOpenSpec() {
  newSpecToggle.value = false
  openSpecToggle.value = !openSpecToggle.value
}

function save() {
  specStore.saveSelected()
}

function reload() {
  specStore.reloadSelected()
}

function addNewSpec() {
  if (addSpecName.value === '') {
    alert('Please provide a spec name')
    return
  }
  specStore.addSpec(
    {
      name: addSpecName.value,
      content: '',
      type: addSpecType.value
    },
    addSpecGroup.value
  )
  newSpecToggle.value = false
}

function fileSelected(event: Event) {
  selectedFile.value = (event.target as HTMLInputElement)?.files?.[0]
}

function openSpecFile() {
  if (!selectedFile.value) {
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    specStore.addSpec(
      {
        name: selectedFile.value!.name,
        content: content,
        type: addSpecType.value
      },
      addSpecGroup.value
    )
    openSpecToggle.value = false
  }
  reader.readAsText(selectedFile.value!)
}
</script>

<template>
  <div class="border-bottom border-1">
    <div>
      <button class="btn btn-dark" :class="{ active: newSpecToggle }" @click="toggleNewSpec">
        <IconPlus />
      </button>
      <button class="btn btn-dark" :class="{ active: openSpecToggle }" @click="toggleOpenSpec">
        <IconOpen />
      </button>
      <button class="btn btn-dark" @click="save"><IconSave /></button>
      <button class="btn btn-dark" @click="reload"><IconReload /></button>
    </div>
    <div v-if="newSpecToggle || openSpecToggle" class="vstack gap-2 m-2">
      <div v-if="newSpecToggle">
        <label for="newSpecName" class="form-label">Name</label>
        <input type="text" class="form-control" id="newSpecName" v-model="addSpecName" />
      </div>
      <div v-if="openSpecToggle">
        <label for="openSpecFile" class="form-label">Open File</label>
        <input class="form-control" type="file" id="openSpecFile" @change="fileSelected" />
      </div>
      <div>
        <div class="form-label">Group</div>
        <div class="btn-group w-100" role="group">
          <input
            type="radio"
            class="btn-check"
            id="addSpecGroupSys"
            :value="SpecGroup.System"
            v-model="addSpecGroup"
          />
          <label class="btn btn-outline-secondary" for="addSpecGroupSys">Sys</label>

          <input
            type="radio"
            class="btn-check"
            id="addSpecGroupEnv"
            :value="SpecGroup.Environment"
            v-model="addSpecGroup"
          />
          <label class="btn btn-outline-secondary" for="addSpecGroupEnv">Env</label>

          <input
            type="radio"
            class="btn-check"
            id="addSpecGroupProp"
            :value="SpecGroup.Property"
            v-model="addSpecGroup"
          />
          <label class="btn btn-outline-secondary" for="addSpecGroupProp">Prop</label>
        </div>
      </div>
      <div>
        <div class="form-label">Spec Type</div>
        <div class="btn-group w-100" role="group">
          <input
            type="radio"
            class="btn-check"
            id="addSpecTypeFSP"
            :value="SpecType.FSP"
            v-model="addSpecType"
          />
          <label class="btn btn-outline-secondary" for="addSpecTypeFSP">FSP</label>

          <input
            type="radio"
            class="btn-check"
            id="addSpecTypeAUT"
            :value="SpecType.AUT"
            v-model="addSpecType"
          />
          <label class="btn btn-outline-secondary" for="addSpecTypeAUT">AUT</label>

          <input
            type="radio"
            class="btn-check"
            id="addSpecTypeFLTL"
            :value="SpecType.FLTL"
            v-model="addSpecType"
          />
          <label class="btn btn-outline-secondary" for="addSpecTypeFLTL">FLTL</label>
        </div>
      </div>
      <button v-if="newSpecToggle" class="btn btn-primary" @click="addNewSpec">Add</button>
      <button v-if="openSpecToggle" class="btn btn-primary" @click="openSpecFile">Open</button>
    </div>
  </div>
</template>
