<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Crepe } from '@milkdown/crepe'
import { outline } from '@milkdown/kit/utils'
import { onBeforeMount } from 'vue'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
onBeforeMount(() => {
  const crepe = useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: props.modelValue.toString(),
      featureConfigs: {
        placeholder: {
          text: '开始写点什么吧...',
          mode: 'doc'
        }
      }
    })
    crepe.on((lm) => {
      lm.updated(() => {
        emit('update:modelValue', crepe.getMarkdown())
      })
    })
    return crepe
  })
  crepe.get()?.action(outline())
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
  background: var(--background-color-1);
  > div {
    height: 100%;
  }
}
</style>
