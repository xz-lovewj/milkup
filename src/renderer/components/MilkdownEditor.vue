<script setup lang="ts">
import { upload, uploadConfig } from '@milkdown/kit/plugin/upload'
import { outline } from '@milkdown/kit/utils'
import { onMounted } from 'vue'
import emitter from '../events'
import { Ctx } from '@milkdown/kit/ctx'
import { uploader } from '@/plugins/customPastePlugin'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { listener, listenerCtx } from '@milkdown/plugin-listener'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
onMounted(async () => {
  const editor = await Editor.make()
    .config(ctx => {
      ctx.set(rootCtx, "#milkdown");
      ctx.set(defaultValueCtx, props.modelValue.toString());
      ctx.update(uploadConfig.key, (prev) => ({ ...prev, uploader, }))
    })
    .use(commonmark)
    .use(listener)
    .use(upload)
    .create()
  editor.action((ctx) => {
    ctx.get(listenerCtx).markdownUpdated((_ctx, nextMarkdown) => {
      emit('update:modelValue', nextMarkdown)
      emitOutlineUpdate(ctx)
    })
    emitOutlineUpdate(ctx)
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
      <div id="milkdown"></div>
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
