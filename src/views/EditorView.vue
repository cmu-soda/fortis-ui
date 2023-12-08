<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Spec } from '@/stores/specs'
import { specStore } from '@/stores/default-stores'
import { eventEmitter } from '@/stores/events'

const content = ref(specStore.selected?.content ?? '')

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
  resize: none;
}
</style>
