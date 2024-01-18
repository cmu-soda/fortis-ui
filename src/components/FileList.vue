<script setup lang="ts">
import { specStore } from '@/stores/default-stores'
import type { Spec, SpecGroup } from '@/stores/specs'

const props = defineProps<{
  name: string
  specs: Spec[]
  group: SpecGroup
  selectedIdx: number
}>()

const emit = defineEmits<{
  (e: 'selected', idx: number, group: SpecGroup): void
}>()

function selectSpec(name: string, idx: number) {
  specStore.selectSpec(name, props.group)
  emit('selected', idx, props.group)
}

function removeSpec(name: string) {
  specStore.removeSpec(name, props.group)
}
</script>

<template>
  <strong>{{ name }}</strong>
  <div class="list-group">
    <button
      v-for="(s, i) in specs"
      :key="s.name"
      type="button"
      class="list-group-item list-group-item-action py-1 d-flex justify-content-between align-items-start pe-0"
      :class="{ active: i === props.selectedIdx }"
      @click="selectSpec(s.name, i)"
    >
      <div class="me-auto">{{ s.changed ? s.name + '*' : s.name }}</div>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        @click.stop="removeSpec(s.name)"
      ></button>
    </button>
  </div>
</template>

<style scoped>
.list-group-item {
  border: none;
}

.list-group {
  border-radius: 0;
  --bs-list-group-active-bg: var(--bs-primary-bg-subtle);
}
</style>
