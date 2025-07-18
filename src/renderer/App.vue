<script setup lang="ts">
import MilkdownEditor from './components/MilkdownEditor.vue'
import { MilkdownProvider } from '@milkdown/vue'
import useContent from '@/hooks/useContent'
import useTitle from '@/hooks/useTitle'
import { nextTick, ref, watch } from 'vue'
import Titlebar from './components/Titlebar.vue'
import useTheme from '@/hooks/useTheme'
import useSourceCode from '@/hooks/useSourceCode'
import MarkdownSourceEditor from './components/MarkdownSourceEditor.vue'
import emitter from './events'
import StatusBar from './components/StatusBar.vue'
const { updateTitle } = useTitle()
const { markdown } = useContent()
const { theme } = useTheme()
const { isShowSource } = useSourceCode()
const isShowEditos = ref(true)

watch(markdown, () => {
  updateTitle()
})
watch([theme, isShowSource], () => {
  reBuildMilkdown()
})
emitter.on('file:Change', () => {
  reBuildMilkdown()
})
function reBuildMilkdown() {
  isShowEditos.value = false
  nextTick(() => {
    isShowEditos.value = true
  })
}
</script>

<template>
  <Titlebar />
  <MilkdownProvider v-if="isShowEditos && !isShowSource">
    <MilkdownEditor v-model="markdown" />
  </MilkdownProvider>
  <MarkdownSourceEditor v-else-if="isShowEditos && isShowSource" v-model="markdown" />
  <StatusBar :content="markdown" />
</template>

<style scoped lang="less"></style>
