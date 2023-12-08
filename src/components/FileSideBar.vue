<script setup lang="ts">
import { ref } from 'vue'
import { SpecGroup } from '@/stores/specs'
import { specStore } from '@/stores/default-stores'
import FileList from './FileList.vue'
import FileToolBar from './FileToolBar.vue'

const sysSelectedIdx = ref(-1)
const envSelectedIdx = ref(-1)
const propSelectedIdx = ref(-1)

function onSelected(idx: number, group: SpecGroup) {
  sysSelectedIdx.value = -1
  envSelectedIdx.value = -1
  propSelectedIdx.value = -1

  switch (group) {
    case SpecGroup.System:
      sysSelectedIdx.value = idx
      break
    case SpecGroup.Environment:
      envSelectedIdx.value = idx
      break
    case SpecGroup.Property:
      propSelectedIdx.value = idx
      break
  }
}
</script>

<template>
  <div class="vstack gap-1">
    <FileToolBar />
    <div class="p-1">
      <FileList
        name="System"
        :specs="specStore.sysSpecs"
        :group="SpecGroup.System"
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
  </div>
</template>
