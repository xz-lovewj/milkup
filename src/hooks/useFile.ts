// useFile.ts
import { nextTick, onUnmounted } from 'vue'
import { processImagePaths, setCurrentMarkdownFilePath } from '@/plugins/imagePathPlugin'
import emitter from '@/renderer/events'
import usContent from './useContent'
import useTitle from './useTitle'

const { updateTitle } = useTitle()
const { markdown, filePath, originalContent } = usContent()

async function onOpen() {
  const result = await window.electronAPI.openFile()
  if (result) {
    // 处理图片路径
    const processedContent = await processImagePaths(result.content, result.filePath)

    filePath.value = result.filePath
    markdown.value = processedContent
    originalContent.value = result.content

    // 设置当前文件路径用于图片路径解析
    setCurrentMarkdownFilePath(result.filePath)

    updateTitle()
    nextTick(() => {
      emitter.emit('file:Change')
    })
  }
}

async function onSave() {
  const saved = await window.electronAPI.saveFile(filePath.value || null, markdown.value)
  if (saved) {
    filePath.value = saved
    originalContent.value = markdown.value
    updateTitle()
  }
  return saved
}

async function onSaveAs() {
  const result = await window.electronAPI.saveFileAs(markdown.value)
  if (result) {
    filePath.value = result.filePath
    originalContent.value = markdown.value
    updateTitle()
  }
}

// ✅ 注册事件：只执行一次（确保是单例）
let hasRegistered = false
function registerMenuEventsOnce() {
  if (hasRegistered)
    return
  hasRegistered = true

  window.electronAPI?.onOpenFileAtLaunch?.(async ({ filePath: launchFilePath, content }) => {
    // 处理图片路径
    const processedContent = await processImagePaths(content, launchFilePath)

    markdown.value = processedContent
    filePath.value = launchFilePath
    originalContent.value = content

    // 设置当前文件路径用于图片路径解析
    setCurrentMarkdownFilePath(launchFilePath)

    updateTitle()
    nextTick(() => {
      emitter.emit('file:Change')
    })
  })

  window.electronAPI.on?.('menu-open', onOpen)
  window.electronAPI.on?.('menu-save', onSave)

  // 拖拽打开 Markdown 文件
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const files = Array.from(event.dataTransfer?.files ?? [])

    if (files.length === 0)
      return

    // 查找 Markdown 文件
    const mdFile = files.find(f => /\.(?:md|markdown)$/i.test(f.name))

    if (!mdFile)
      return

    // 检查当前是否有内容需要处理
    const hasCurrentContent = markdown.value.trim().length > 0

    if (hasCurrentContent) {
      // 显示确认对话框
      const userChoice = await window.electronAPI.showOverwriteConfirm(mdFile.name)

      if (userChoice === 0) {
        // 用户选择取消
        return
      } else if (userChoice === 2) {
        // 用户选择保存当前内容
        try {
          await onSave()
        } catch (error) {
          console.error('保存当前文件失败:', error)
          return // 如果保存失败，不继续打开新文件
        }
      }
      // userChoice === 1 表示覆盖当前内容，直接继续执行
    }

    try {
      // 尝试获取文件的完整路径
      let fullPath: string | null = null

      try {
        // 使用 webUtils.getPathForFile 方法
        const pathResult = window.electronAPI.getPathForFile(mdFile)
        fullPath = pathResult || null
      } catch (error) {
      }

      // 如果 webUtils 方法失败，尝试备用方法
      if (!fullPath) {
        const electronFile = mdFile as any
        if (electronFile.path) {
          fullPath = electronFile.path
        } else if (process.platform === 'win32' && mdFile.name) {
          // Windows 特定处理：尝试从 File 对象获取路径
          // 在 Windows 上，如果无法获取完整路径，至少记录文件名
          console.warn('Windows: 无法获取文件完整路径，使用文件名:', mdFile.name)
        }
      }

      if (fullPath) {
        // 如果有完整路径，通过IPC读取文件以获取正确的路径信息
        const result = await window.electronAPI.readFileByPath(fullPath)
        if (result) {
          // 处理图片路径
          const processedContent = await processImagePaths(result.content, result.filePath)

          markdown.value = processedContent
          filePath.value = result.filePath
          originalContent.value = result.content

          // 设置当前文件路径用于图片路径解析
          setCurrentMarkdownFilePath(result.filePath)

          updateTitle()
          nextTick(() => {
            emitter.emit('file:Change')
          })
          return
        }
      }

      // 如果无法获取完整路径，回退到直接读取文件内容
      const content = await mdFile.text()

      // 注意：这里无法处理相对路径图片，因为没有完整的文件路径
      // 图片路径解析需要知道 Markdown 文件的实际位置

      markdown.value = content
      filePath.value = mdFile.name
      originalContent.value = content

      // 清除文件路径，因为无法解析图片
      setCurrentMarkdownFilePath(null)

      updateTitle()
      nextTick(() => {
        emitter.emit('file:Change')
      })
    } catch (error) {
      console.error('读取拖拽文件失败:', error)
    }
  }

  window.addEventListener('dragover', handleDragOver)
  window.addEventListener('drop', handleDrop)
}

// ✅ 立即注册（只注册一次）
registerMenuEventsOnce()

export default function useFile() {
  onUnmounted(() => {
    window.electronAPI?.removeListener?.('menu-open', onOpen)
    window.electronAPI?.removeListener?.('menu-save', onSave)
  })
  return {
    onOpen,
    onSave,
    onSaveAs,
  }
}
