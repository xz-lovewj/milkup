import { computed, onUnmounted, ref, watch } from 'vue'

const contentInfo = {
  markdown: ref(''),
  originalContent: ref(''), // 打开或保存后的原始内容
  filePath: ref(''),
}
const isModified = computed(() => contentInfo.markdown.value !== contentInfo.originalContent.value)
const currentScrollRatio = ref(0)
const isInitialized = ref(false)

watch(isModified, (newValue) => {
  window.electronAPI.changeSaveStatus(!newValue) // 通知主进程保存状态, 修改后(isModified==true) isSaved 为 false
}, { immediate: true })

function recordScrollRatio(wrapper: HTMLElement) {
  currentScrollRatio.value = wrapper.scrollTop / (wrapper.scrollHeight - wrapper.clientHeight)
}

function initScrollListener() {
  if (isInitialized.value) return
  const milkdownWrapper = document.querySelector('.scrollView.milkdown') as HTMLElement | null
  const codeMirrorWrapper = document.querySelector('.cm-scroller') as HTMLElement | null
  if (milkdownWrapper) {
    milkdownWrapper.addEventListener('scroll', () => recordScrollRatio(milkdownWrapper))
  } else if (codeMirrorWrapper) {
    codeMirrorWrapper.addEventListener('scroll', () => recordScrollRatio(codeMirrorWrapper))
  }
  isInitialized.value = true
}

function removeScrollListener() {
  const milkdownWrapper = document.querySelector('.scrollView.milkdown') as HTMLElement | null
  const codeMirrorWrapper = document.querySelector('.cm-scroller') as HTMLElement | null
  if (milkdownWrapper) {
    milkdownWrapper.removeEventListener('scroll', () => recordScrollRatio(milkdownWrapper))
  } else if (codeMirrorWrapper) {
    codeMirrorWrapper.removeEventListener('scroll', () => recordScrollRatio(codeMirrorWrapper))
  }
  isInitialized.value = false
}

export default () => {
  onUnmounted(() => {
    removeScrollListener()
  })


  return {
    ...contentInfo,
    isModified,
    currentScrollRatio,
    initScrollListener
  }
}
