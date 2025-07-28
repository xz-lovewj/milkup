<script setup lang="ts">
import { upload, uploadConfig } from '@milkdown/kit/plugin/upload'
import { uploader } from '@/plugins/customPastePlugin'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { outline } from '@milkdown/kit/utils'
import { onMounted } from 'vue'
import { Ctx } from '@milkdown/kit/ctx'
import { commonmark } from '@milkdown/preset-commonmark'
import { automd } from '@milkdown/plugin-automd'
import { Crepe } from '@milkdown/crepe'

import emitter from '../events'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

onMounted(async () => {
  // const editor = await Editor.make()
  //   .config(ctx => {
  //     ctx.set(rootCtx, "#milkdown");
  //     ctx.set(defaultValueCtx, props.modelValue.toString());
  //     ctx.update(uploadConfig.key, (prev) => ({ ...prev, uploader, }))
  //   })
  //   .use(commonmark)
  //   .use(listener)
  //   .use(history)
  //   .use(upload)
  //   .use(automd)
  //   .create()
  // editor.action((ctx) => {
  //   ctx.get(listenerCtx).markdownUpdated((_ctx, nextMarkdown) => {
  //     emit('update:modelValue', nextMarkdown)
  //     emitOutlineUpdate(ctx)
  //   })
  //   emitOutlineUpdate(ctx)
  // })
  // crepe 有更好的用户体验👇
  const crepe = new Crepe({
    root: document.querySelector('#milkdown') as HTMLElement,
    defaultValue: props.modelValue.toString(),
    featureConfigs: {
      placeholder: {
        text: '开始写点什么吧...',
        mode: 'doc',
      },
    }
  })
  const editor = crepe.editor
  editor.ctx.inject(uploadConfig.key)
  editor.ctx.inject(listenerCtx)

  editor.use(commonmark)
    .use(listener)
    .use(automd)
    .use(upload)
  await crepe.create()
  editor.action((ctx) => {
    ctx.get(listenerCtx).markdownUpdated((_ctx, nextMarkdown) => {
      emit('update:modelValue', nextMarkdown)
      emitOutlineUpdate(ctx)
    })
    emitOutlineUpdate(ctx)
  })
  editor.ctx.update(uploadConfig.key, (prev) => ({ ...prev, uploader }))
  editor.ctx.update(listenerCtx, (prev) => {
    return prev
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
