<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Crepe } from '@milkdown/crepe'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

useEditor((root) => {
  const crepe = new Crepe({
    root,
    defaultValue: props.modelValue.toString(),
  })
  crepe.on((lm) => {
    lm.updated(() => {
      emit('update:modelValue', crepe.getMarkdown())
    })
  })
  return crepe
})
</script>

<template>
  <Milkdown />
</template>
