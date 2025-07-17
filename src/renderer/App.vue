<script setup lang="ts">
import MilkdownEditor from './components/MilkdownEditor.vue'
import { MilkdownProvider } from '@milkdown/vue'
import useContent from '@/hooks/useContent'
import useTitle from '@/hooks/useTitle'
import { watch } from 'vue'
import Titlebar from './components/Titlebar.vue'
import useFile from '@/hooks/useFile'
import useTheme from '@/hooks/useTheme'
const { updateTitle } = useTitle()
const { markdown } = useContent()
const { theme } = useTheme()
const { reBuildMilkdown, openFileRefreshFlag } = useFile()

watch(markdown, () => {
  updateTitle()
})
watch(theme, () => {
  reBuildMilkdown()
})
</script>

<template>
  <Titlebar />
  <MilkdownProvider v-if="!openFileRefreshFlag">
    <MilkdownEditor v-model="markdown" />
  </MilkdownProvider>
</template>

<style scoped lang="less"></style>
