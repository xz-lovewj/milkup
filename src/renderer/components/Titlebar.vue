<script setup lang="ts">
import { ref } from "vue"
import useTitle from "../../hooks/useTitle"
import useContent from "@/hooks/useContent"
import MenuDropDown from "./MenuDropDown.vue"
import useFile from "@/hooks/useFile"

const isWin = window.electronAPI.platform === 'win32'
const { title } = useTitle()
const { isModified } = useContent()
const { onSave } = useFile()

const isFullScreen = ref(false)
const minimize = () => {
  window.electronAPI?.windowControl?.("minimize")
}
const toggleMaximize = () => {
  isFullScreen.value = !isFullScreen.value
  window.electronAPI?.windowControl?.("maximize")
}
const close = async function () {
  if (isModified.value) {
    const confirmClose = await window.electronAPI?.showMessageBoxSync({
      type: 'warning',
      title: '确认关闭',
      message: '当前文档有未保存的修改，是否确认关闭？',
      buttons: ['确认', '保存并关闭', '取消'],
      defaultId: 1,
      cancelId: 2
    })
    if (confirmClose.response == 0) window.electronAPI?.windowControl?.("close")
    else if (confirmClose.response == 1) {
      const isSaved = await onSave()
      if (isSaved) window.electronAPI?.windowControl?.("close")
      else return
    }
    else return
  } else {
    window.electronAPI?.windowControl?.("close")
  }
}
</script>

<template>
  <div class="TitlebarBox">
    <template v-if="isWin">
      <MenuDropDown />
      <div class="title" @dblclick="toggleMaximize">{{ title }}</div>
      <div class="window-controls">
        <span @click="minimize" class="iconfont icon-min"></span>
        <span @click="toggleMaximize" class="iconfont" :class="isFullScreen ? 'icon-normal' : 'icon-max'"></span>
        <span @click="close" class="iconfont icon-close"></span>
      </div>
    </template>
    <template v-else>
      <div></div>
      <div class="title" @dblclick="toggleMaximize">{{ title }}</div>
      <MenuDropDown />
    </template>
  </div>
</template>

<style lang="less" scoped>
.TitlebarBox {
  -webkit-app-region: drag;
  /* ✅ 允许拖动窗口 */
  height: 32px;
  background: var(--background-color-1);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  padding-right: 0;
  user-select: none;

  .window-controls {
    display: flex;
    -webkit-app-region: no-drag;

    /* ✅ 控制按钮不能拖动 */
    span {
      cursor: pointer;
      font-size: 16px;
      color: var(--text-color-1);
      padding: 8px;

      &:hover {
        background: var(--hover-color);
      }

      &.icon-close:hover {
        background: #ff5f56;
        color: white;
      }
    }
  }
}
</style>
