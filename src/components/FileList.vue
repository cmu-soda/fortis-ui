<script setup lang="ts">
const props = defineProps<{
  name: string,
  files: string[]
}>()

</script>

<template>
  <strong>{{ name }}</strong>
  <div class="list-group">
    <button v-for="f in files" :key="f" type="button" class="list-group-item list-group-item-action">{{ f }}</button>
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
