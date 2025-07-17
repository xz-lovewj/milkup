<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Crepe } from '@milkdown/crepe'
import StatusBar from './StatusBar.vue';

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
  <StatusBar :content="modelValue" />
</template>
<style scoped lang="less">
.scrollView {
  height: 100%;
  overflow-y: auto;
  background: #fff;
  > div {
    height: 100%;
  }
}
</style>
