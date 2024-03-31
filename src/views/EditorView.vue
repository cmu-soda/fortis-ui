<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Spec } from '@/stores/specs'
import { specStore } from '@/stores/default-stores'
import { eventEmitter } from '@/stores/events'

const content = ref(
  specStore.selected ? specStore.selected.cached ?? specStore.selected.content : ''
)

watch(
  () => specStore.selected,
  (selected?: Spec) => {
    content.value = selected?.cached ?? ''
  }
)

watch(
  () => eventEmitter.reloadSelectedTrigger,
  () => {
    content.value = specStore.selected?.content ?? ''
  }
)

function onContentInput() {
  if (specStore.selected) {
    specStore.selected.changed = true
  }
}

function onContentChange() {
  if (specStore.selected) {
    specStore.selected.cached = content.value
  }
}

let saveKeyPressed: (e: KeyboardEvent) => void

onMounted(() => {
  saveKeyPressed = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      onContentChange()
      specStore.saveSelected()
    }
  }
  window.addEventListener('keydown', saveKeyPressed)
})

onUnmounted(() => {
  window.removeEventListener('keydown', saveKeyPressed)
})
</script>

<template>
  <textarea
    class="full-width h-100"
    v-model="content"
    @input="onContentInput"
    @change="onContentChange"
  ></textarea>
</template>

<style scoped>
textarea {
  padding: 8px;
  padding-bottom: 80vh;
  resize: none;
}
</style>
