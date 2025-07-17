<script setup lang="ts">
import { ref } from 'vue'
import usefile from '@/hooks/useFile'
import ThemeSetter from './ThemeSetter.vue'
import About from './About.vue'

const { onOpen, onSave, onSaveAs } = usefile()

const isShowSetTheme = ref(false)
function showSetTheme() {
  isShowSetTheme.value = !isShowSetTheme.value
}
</script>

<template>
  <div class="MenubarBox">
    <div class="optionsContainer">
      <span @click="onOpen">📂 打开</span>
      <span @click="onSave">💾 保存</span>
      <span @click="onSaveAs">💾 另存为</span>
      <span @click="showSetTheme">🌞 主题</span>
    </div>
    <div class="detailContainer">
      <ThemeSetter v-if="isShowSetTheme" />
      <About v-else />
    </div>
  </div>
</template>

<style lang="less" scoped>
.MenubarBox {
  height: 100%;
  display: flex;
  .detailContainer {
    flex: 1;
    padding: 12px;
    background: var(--background-color-2);

  }
  .optionsContainer {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 12px 0;
    width: 120px;
    gap: 4px;
    -webkit-app-region: drag;
    background: var(--background-color);

    span {
      cursor: pointer;
      width: 100%;
      -webkit-app-region: no-drag;
      padding: 8px;
      font-size: 14px;
      display: flex;
      align-items: center;
      color: var(--text-color);
      &:hover {
        background: var(--hover-color);
      }
    }
  }
}
</style>
