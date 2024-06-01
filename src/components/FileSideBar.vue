<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SpecGroup } from '@/stores/specs'
import {
  specStore,
  loadTherac25,
  loadVoting,
  loadOyster,
  loadInfusionPump
} from '@/stores/default-stores'
import FileList from './FileList.vue'
import FileToolBar from './FileToolBar.vue'

const sysSelectedIdx = ref(-1)
const envSelectedIdx = ref(-1)
const propSelectedIdx = ref(-1)
const router = useRouter()
const route = useRoute()

const isDev = computed(() => process.env.NODE_ENV === 'development')

function onSelected(idx: number, group: SpecGroup) {
  sysSelectedIdx.value = -1
  envSelectedIdx.value = -1
  propSelectedIdx.value = -1

  switch (group) {
    case SpecGroup.Machine:
      sysSelectedIdx.value = idx
      break
    case SpecGroup.Environment:
      envSelectedIdx.value = idx
      break
    case SpecGroup.Property:
      propSelectedIdx.value = idx
      break
  }

  if (route.name !== 'editor') {
    router.push({ name: 'editor' })
  }
}
</script>

<template>
  <div class="vstack gap-1">
    <FileToolBar />
    <div class="p-1">
      <FileList
        name="Machine"
        :specs="specStore.sysSpecs"
        :group="SpecGroup.Machine"
        :selected-idx="sysSelectedIdx"
        @selected="onSelected"
      />
    </div>
    <div class="p-1">
      <FileList
        name="Environment"
        :specs="specStore.envSpecs"
        :group="SpecGroup.Environment"
        :selected-idx="envSelectedIdx"
        @selected="onSelected"
      />
    </div>
    <div class="p-1">
      <FileList
        name="Property"
        :specs="specStore.propSpecs"
        :group="SpecGroup.Property"
        :selected-idx="propSelectedIdx"
        @selected="onSelected"
      />
    </div>

    <div v-if="isDev">
      <div class="p-1"><button class="btn btn-info" @click="loadTherac25">Therac25</button></div>
      <div class="p-1"><button class="btn btn-info" @click="loadVoting">Voting</button></div>
      <div class="p-1"><button class="btn btn-info" @click="loadOyster">Oyster</button></div>
      <div class="p-1">
        <button class="btn btn-info" @click="loadInfusionPump">Infusion Pump</button>
      </div>
    </div>
  </div>
</template>
