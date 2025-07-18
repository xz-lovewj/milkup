<script setup lang="ts">
import useTheme from '@/hooks/useTheme'
import { ref } from 'vue'

const { defaultThemes, theme, setTheme } = useTheme()
const isShowThemeDropdown = ref(false)

function handleChangeTheme(selectedTheme: string) {
  setTheme(selectedTheme)
  isShowThemeDropdown.value = false
}
function handleClickOutside() {
  isShowThemeDropdown.value && (isShowThemeDropdown.value = false)
}
</script>

<template>
  <div class="ThemeSetterBox" @click.stop="handleClickOutside">
    <div class="theme-options">
      <span>当前主题：</span>
      <span @click.stop="isShowThemeDropdown = !isShowThemeDropdown" class="dropdownBtn">
        <span>{{ theme }}</span>
        <Transition name="fade">
          <div class="dropdownPanel" v-show="isShowThemeDropdown" :style="{ height: defaultThemes.length * 40 + 'px' }">
            <div class="dropdown-items" v-for="t in defaultThemes">
              <span @click.stop="handleChangeTheme(t)" :class="{ active: t === theme }">{{ t }}</span>
            </div>
          </div>
        </Transition>
      </span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ThemeSetterBox {
  width: 100%;
  .theme-options {
    position: relative;
    display: flex;
    align-items: center;
  }
  .dropdownPanel {
    position: absolute;
    width: 100%;
    top: calc(100% + 8px);
    left: 0;
    background: var(--background-color-3);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    .dropdown-items {
      display: flex;
      flex-direction: column;
      &:hover {
        background: var(--hover-color);
      }
      span {
        padding: 8px;
        cursor: pointer;
        &:hover {
          background: var(--hover-background-color-2);
        }
        &.active {
          background: var(--active-background-color);
          font-weight: bold;
        }
      }
    }
  }
  .dropdownBtn {
    display: inline-block;
    position: relative;
    cursor: pointer;
    padding: 8px;
    background: var(--background-color-2);
    color: var(--text-color);
    border-radius: 4px;
    transition: background 0.3s;
    border: 1px solid var(--border-color-2);
    span {
      display: inline-block;
      min-width: 150px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
