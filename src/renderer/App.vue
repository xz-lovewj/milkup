<script setup lang="ts">
import MilkdownEditor from './components/MilkdownEditor.vue'
import { MilkdownProvider } from '@milkdown/vue'
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const filePath = ref('')
const markdown = ref('')
const openFileRefreshFlag = ref(false)
const originalContent = ref('') // 打开或保存后的原始内容
const isModified = computed(() => markdown.value !== originalContent.value)
const title = ref('MilkUp')
const isFullScreen = ref(false)

const fileName = computed(() => {
  const parts = filePath.value.split(/[\\/]/)
  return parts.at(-1) ?? ''
})

onMounted(() => {
  window.electronAPI?.on?.('menu-open', onOpen)
  window.electronAPI?.on?.('menu-save', onSave)
})
onBeforeUnmount(() => {
  window.electronAPI?.removeListener?.('menu-open', onOpen)
  window.electronAPI?.removeListener?.('menu-save', onSave)
})

const onOpen = async () => {
  const result = await window.electronAPI.openFile()
  if (result) {
    openFileRefreshFlag.value = true
    filePath.value = result.filePath
    markdown.value = result.content
    originalContent.value = result.content // 保存原始内容以便比较修改
    updateTitle()
    nextTick(() => {
      openFileRefreshFlag.value = false
    })
  }
}

const onSave = async () => {
  const saved = await window.electronAPI.saveFile(filePath.value || null, markdown.value)
  if (saved) {
    filePath.value = saved
    originalContent.value = markdown.value // 更新原始内容为当前内容
    updateTitle()
  }
}
function updateTitle() {
  const name = fileName.value || 'Untitled'
  const prefix = isModified.value ? '*' : ''
  window.electronAPI.setTitle(`MilkUp - ${prefix}${name}`)
  title.value = `MilkUp - ${prefix}${name}`
}
watch(markdown, () => {
  updateTitle()
})

const minimize = () => {
  window.electronAPI?.windowControl?.('minimize')
}
const toggleMaximize = () => {
  isFullScreen.value = !isFullScreen.value
  window.electronAPI?.windowControl?.('maximize')
}
const close = () => window.electronAPI?.windowControl?.('close')
</script>

<template>
  <div class="title-bar">
    <div class="title" @dblclick="toggleMaximize">{{ title }}</div>
    <div class="window-controls">
      <span @click="minimize" class="iconfont icon-min"></span>
      <span @click="toggleMaximize" class="iconfont" :class="isFullScreen ? 'icon-normal' : 'icon-max'"></span>
      <span @click="close" class="iconfont icon-close"></span>
    </div>
  </div>
  <div class="top-bar">
    <div class="menu-bar">
      <span @click="onOpen">📂 打开</span>
      <span @click="onSave">💾 保存</span>
    </div>
  </div>
  <div class="scrollView">
    <MilkdownProvider>
      <MilkdownEditor v-model="markdown" v-if="!openFileRefreshFlag" />
    </MilkdownProvider>
  </div>
</template>

<style scoped lang="less">
.scrollView{
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  background: #fff;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  background: #f0f0f0;
  -webkit-app-region: drag;
}
.menu-bar span {
  margin-right: 12px;
  cursor: pointer;
  -webkit-app-region: no-drag;
}
.toolbar {
  margin-bottom: 1rem;
}
button {
  margin-right: 0.5rem;
}
.title-bar {
  -webkit-app-region: drag; /* ✅ 允许拖动窗口 */
  height: 32px;
  background: #e0e0e0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  padding-right: 0;
  user-select: none;
}

.window-controls {
  display: flex;
  -webkit-app-region: no-drag; /* ✅ 控制按钮不能拖动 */
  span {
    cursor: pointer;
    font-size: 16px;
    color: #333;
    padding: 8px;
    &:hover {
      background: #d0d0d0;
    }
    &.icon-close:hover {
      background: #ff5f56;
      color: white;
    }
  }
}
.window-controls button {
  width: 32px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}
</style>
