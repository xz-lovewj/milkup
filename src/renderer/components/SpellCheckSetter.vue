<script setup lang="ts">
import useSpellCheck from '@/hooks/useSpellCheck'

const { isSpellCheckEnabled, applySpellCheck } = useSpellCheck()
function handleSpellCheckChange() {
  applySpellCheck(isSpellCheckEnabled.value)
}
</script>

<template>
  <div class="SpellCheckSetterBox">
    <span class="title">拼写检查：</span>
    <span class="switch">
      <input type="checkbox" id="spellcheck" v-model="isSpellCheckEnabled" @change="handleSpellCheckChange" />
      <label for="spellcheck">启用拼写检查</label>
    </span>
  </div>
</template>

<style lang="less" scoped>
.SpellCheckSetterBox {
  width: 100%;
}
</style>
