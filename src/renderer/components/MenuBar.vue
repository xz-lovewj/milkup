<script setup lang="ts">
import usefile from '@/hooks/useFile'

const { onOpen, onSave } = usefile()
</script>

<template>
  <div class="MenubarBox">
    <span @click="onOpen">📂 打开</span>
    <span @click="onSave">💾 保存</span>
  </div>
</template>

<style lang="less" scoped>
.MenubarBox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  background: #f0f0f0;
  -webkit-app-region: drag;
  span {
    margin-right: 12px;
    cursor: pointer;
    -webkit-app-region: no-drag;
  }
}
</style>
