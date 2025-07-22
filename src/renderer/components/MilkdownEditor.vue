<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Crepe } from '@milkdown/crepe'
import { outline } from '@milkdown/kit/utils'
import { onBeforeMount } from 'vue'
import emitter from '../events'
import { Ctx } from '@milkdown/kit/ctx'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
onBeforeMount(() => {
  useEditor((root) => {
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
        const ctx = crepe.editor.ctx
        emitOutlineUpdate(ctx)
      })
      lm.mounted(() => {
        emit('update:modelValue', crepe.getMarkdown())
        const ctx = crepe.editor.ctx
        emitOutlineUpdate(ctx)
      })
    })
    return crepe
  })
})
function emitOutlineUpdate(ctx: Ctx) {
  const headings = outline()(ctx)
  emitter.emit('outline:Update', headings)
}
</script>

<template>
  <div class="editor-box">
    <div class="scrollView">
      <Milkdown />
    </div>
  </div>
</template>
<style scoped lang="less">
.editor-box {
  width: 100%;
  height: 100%;
  display: flex;

  .scrollView {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    background: var(--background-color-1);

    >div {
      height: 100%;
    }
  }
}
</style>
