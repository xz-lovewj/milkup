<script setup lang="ts">
import MilkdownEditor from './components/MilkdownEditor.vue'
import { MilkdownProvider } from '@milkdown/vue'
import useContent from '@/hooks/useContent'
import useTitle from '@/hooks/useTitle'
import { watch } from 'vue'
import Titlebar from './components/Titlebar.vue'
import MenuBar from './components/MenuBar.vue'
import { openFileRefreshFlag } from '@/hooks/useFile'

const { updateTitle } = useTitle()
const { markdown } = useContent()

watch(markdown, () => {
  updateTitle()
})
</script>

<template>
  <Titlebar />
  <MenuBar />
  <MilkdownProvider>
    <MilkdownEditor v-model="markdown" v-if="!openFileRefreshFlag" />
  </MilkdownProvider>
</template>

<style scoped lang="less">

</style>
