<script setup lang="ts">
import { ref } from 'vue'
import usefile from '@/hooks/useFile'
import About from './About.vue'
import SettingBase from './SettingBase.vue'

const { onOpen, onSave, onSaveAs } = usefile()

const activeTab = ref<'settings' | 'about'>('about')
const MenuComponents = {
  settings: SettingBase,
  about: About
}
const MenuOptions = [
  { label: '📂 打开', action: onOpen },
  { label: '💾 保存', action: onSave },
  { label: '💾 另存为', action: onSaveAs },
  { label: '⚙️ 设置', action: () => (activeTab.value = 'settings'), value: 'settings' },
  { label: 'ℹ️ 关于', action: () => (activeTab.value = 'about'), value: 'about' }
]
</script>

<template>
  <div class="MenubarBox">
    <div class="optionsContainer">
      <span v-for="option in MenuOptions" :key="option.label" @click="option.action" :class="{ active: activeTab === option.value }">
        {{ option.label }}
      </span>
    </div>
    <div class="detailContainer">
      <div class="components">
        <component :is="MenuComponents[activeTab]" />
      </div>
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
    .components {
      height: 100%;
    }
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
      &.active {
        background: var(--active-color);
        font-weight: bold;
      }
    }
  }
}
</style>
