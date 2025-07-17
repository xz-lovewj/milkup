import { nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import usContent from "./useContent"
import useTitle from "./useTitle"

const { updateTitle } = useTitle()
const { markdown, filePath, originalContent } = usContent()

export const openFileRefreshFlag = ref(false)
const useFile = () => {
  window.electronAPI.onOpenFileAtLaunch(({ filePath: launchFilePath, content }) => {
    openFileRefreshFlag.value = true
    markdown.value = content
    filePath.value = launchFilePath
    originalContent.value = content
    updateTitle()
    nextTick(() => {
      openFileRefreshFlag.value = false
    })
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
  const onSaveAs = async () => {
    const result = await window.electronAPI.saveFileAs(markdown.value)
    if (result) {
      filePath.value = result.filePath
      originalContent.value = markdown.value // 更新原始内容为当前内容
      updateTitle()
    }
  }

  onMounted(() => {
    window.electronAPI?.on?.('menu-open', onOpen)
    window.electronAPI?.on?.('menu-save', onSave)
  })

  onBeforeUnmount(() => {
    window.electronAPI?.removeListener?.('menu-open', onOpen)
    window.electronAPI?.removeListener?.('menu-save', onSave)
  })

  return {
    openFileRefreshFlag,
    onOpen,
    onSave,
    onSaveAs
  }
}
export default useFile