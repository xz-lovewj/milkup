<script setup lang="ts">
import useSpellCheck from '@/hooks/useSpellCheck'

const { isSpellCheckEnabled, applySpellCheck } = useSpellCheck()
function handleSpellCheckChange() {
  applySpellCheck(isSpellCheckEnabled.value)
}
</script>

<template>
  <div class="SpellCheckSetterBox">
    <span class="switch">
      <input type="checkbox" id="spellcheck" v-model="isSpellCheckEnabled" @input="handleSpellCheckChange" />
      <label for="spellcheck">启用拼写检查</label>
    </span>
  </div>
</template>

<style lang="less" scoped>
.SpellCheckSetterBox {
  width: 100%;
  cursor: pointer;

  label {
    cursor: pointer;
  }
}
</style>
