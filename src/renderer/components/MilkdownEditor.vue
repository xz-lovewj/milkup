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
    defaultValue: props.modelValue.toString()
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
  <div class="scrollView">
    <Milkdown />
  </div>
</template>
<style scoped lang="less">
.scrollView {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  background: #fff;
}
</style>
