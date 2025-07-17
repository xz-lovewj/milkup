<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  content: string
}>()

const mode = ref<'chars' | 'lines'>('chars')

const displayText = computed(() => {
  const text = props.content ?? ''
  switch (mode.value) {
    case 'chars':
      return `${(text || '').replace(/\s/g, '').length} 字符`
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
</script>

<template>
  <div class="StatusBarBox" @click="cycleMode">
    {{ displayText }}
  </div>
</template>

<style lang="less" scoped>
.StatusBarBox {
  user-select: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  color: #666;
  text-align: right;
}
</style>
