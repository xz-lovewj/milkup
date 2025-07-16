<script setup lang="ts">
import { ref } from 'vue'
import useTitle from '../../hooks/useTitle'

const { title } = useTitle()

const isFullScreen = ref(false)
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
  <div class="TitlebarBox">
    <div class="title" @dblclick="toggleMaximize">{{ title }}</div>
    <div class="window-controls">
      <span @click="minimize" class="iconfont icon-min"></span>
      <span @click="toggleMaximize" class="iconfont" :class="isFullScreen ? 'icon-normal' : 'icon-max'"></span>
      <span @click="close" class="iconfont icon-close"></span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.TitlebarBox {
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
}
</style>
