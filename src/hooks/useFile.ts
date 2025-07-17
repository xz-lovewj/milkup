// useFile.ts
import { nextTick, onUnmounted, ref } from "vue"
import usContent from "./useContent"
import useTitle from "./useTitle"

const { updateTitle } = useTitle()
const { markdown, filePath, originalContent } = usContent()

export const openFileRefreshFlag = ref(false)

const onOpen = async () => {
  const result = await window.electronAPI.openFile()
  if (result) {
    openFileRefreshFlag.value = true
    filePath.value = result.filePath
    markdown.value = result.content
    originalContent.value = result.content
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
    originalContent.value = markdown.value
    updateTitle()
  }
}

const onSaveAs = async () => {
  const result = await window.electronAPI.saveFileAs(markdown.value)
  if (result) {
    filePath.value = result.filePath
    originalContent.value = markdown.value
    updateTitle()
  }
}

const reBuildMilkdown = () => {
  openFileRefreshFlag.value = true
  nextTick(() => {
    openFileRefreshFlag.value = false
  })
}

// ✅ 注册事件：只执行一次（确保是单例）
let hasRegistered = false
function registerMenuEventsOnce() {
  if (hasRegistered) return
  hasRegistered = true

  window.electronAPI?.onOpenFileAtLaunch?.(({ filePath: launchFilePath, content }) => {
    openFileRefreshFlag.value = true
    markdown.value = content
    filePath.value = launchFilePath
    originalContent.value = content
    updateTitle()
    nextTick(() => {
      openFileRefreshFlag.value = false
    })
  })

  window.electronAPI?.on?.('menu-open', onOpen)
  window.electronAPI?.on?.('menu-save', onSave)
}

// ✅ 立即注册（只注册一次）
registerMenuEventsOnce()

export default function useFile() {
  onUnmounted(() => {
    window.electronAPI?.removeListener?.('menu-open', onOpen)
    window.electronAPI?.removeListener?.('menu-save', onSave)
  })
  return {
    openFileRefreshFlag,
    reBuildMilkdown,
    onOpen,
    onSave,
    onSaveAs
  }
}
