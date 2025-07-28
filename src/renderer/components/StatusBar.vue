<script setup lang="ts">
import { computed, ref } from 'vue'
import useSourceCode from '@/hooks/useSourceCode'
import { toggleShowOutline } from '@/hooks/useOutline';

const { isShowSource, toggleSourceCode } = useSourceCode()
const props = defineProps<{
  content: string
}>()

const mode = ref<'chars' | 'lines'>('chars')

const displayText = computed(() => {
  const text = props.content ?? ''
  switch (mode.value) {
    case 'chars':
      return `${countMarkdownChars(text)} 字符`
    case 'lines':
      return `${countMarkdownLines(text)} 行`
  }
})
function cycleMode() {
  if (mode.value === 'chars') mode.value = 'lines'
  else if (mode.value === 'lines') mode.value = 'chars'
}
function countMarkdownLines(text: string, options = { skipEmpty: true }): number {
  if (!text) return 0
  const rawLines = text.split(/(?:\n{2,}|<br\s*\/?>|  \n)/g)
  if (options.skipEmpty) {
    return rawLines.filter((line) => line.trim().length > 0).length
  }
  return rawLines.length
}
function countMarkdownChars(text: string): number {
  const base64Regex = /data:image\/[a-zA-Z]+;base64,[a-zA-Z0-9+/=]+/g
  return (text.replaceAll('&#x20;', '').replace(base64Regex, 'image').trim() || '').split('').length
}
window.electronAPI.on('view:toggleView', () => {
  toggleSourceCode()
})
</script>

<template>
  <div class="StatusBarBox">
    <div>
      <Transition name="fade">
        <span class="iconfont icon-List-outlined" @click="toggleShowOutline" v-if="!isShowSource"></span>
      </Transition>
      <span class="iconfont" @click.stop="toggleSourceCode" :class="isShowSource ? 'icon-input' : 'icon-markdown'">
      </span>
    </div>
    <span @click="cycleMode">{{ displayText }}</span>
  </div>
</template>

<style lang="less" scoped>
.StatusBarBox {
  user-select: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-color-1);
  text-align: right;
  background: var(--background-color-2);
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    padding: 2px 8px;
    display: inline-block;
    &:hover {
      background: var(--hover-color);
    }
  }
}
</style>
