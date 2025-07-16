import { computed, ref } from "vue"

const contentInfo = {
  markdown: ref(''),
  originalContent: ref(''), // 打开或保存后的原始内容
  filePath: ref(''),
}
const isModified = computed(() => contentInfo.markdown.value !== contentInfo.originalContent.value)


export default () => {
  return {
    ...contentInfo,
    isModified
  }
}