<script setup lang="ts">
import { computed, ref } from 'vue'

interface ThemeOption {
  name: string
  label: string
  type: 'light' | 'dark'
  color: string // 主题色彩预览
  description: string // 主题描述
}

// 扩展主题选项
const themeOptions: ThemeOption[] = [
  {
    name: 'normal',
    label: '亮色主题',
    type: 'light',
    color: '#88c0d0',
    description: '明亮清新的标准主题，适合日常使用',
  },
  {
    name: 'normal-dark',
    label: '暗色主题',
    type: 'dark',
    color: '#3b4252',
    description: '深色风格主题，减少夜间使用时的眼睛疲劳',
  },
  {
    name: 'crepe',
    label: 'GitHub主题',
    type: 'light',
    color: '#ffffff',
    description: '类似GitHub风格的明亮主题，干净整洁',
  },
  {
    name: 'crepe-dark',
    label: '深色GitHub主题',
    type: 'dark',
    color: '#0d1117',
    description: 'GitHub深色模式风格，适合夜间或弱光环境',
  },
  {
    name: 'frame',
    label: '纸张护眼色',
    type: 'light',
    color: '#f5f5dc',
    description: '类似纸张的米色背景，减少视觉疲劳，适合长时间阅读',
  },
  {
    name: 'frame-dark',
    label: '暖色主题',
    type: 'dark',
    color: '#2d2d2d',
    description: '温暖的深色主题，减轻眼睛负担，带来舒适的夜间使用体验',
  },
]

// 当前主题
const currentThemeName = ref(localStorage.getItem('theme-name') || 'normal')

// 计算当前主题对象
const currentTheme = computed(() => {
  return themeOptions.find(t => t.name === currentThemeName.value) || themeOptions[0]
})

// 设置主题
function setMilkdownTheme(themeName: string, themeType: 'light' | 'dark') {
  const id = 'milkdown-theme'
  let link = document.getElementById(id) as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  let basePath = ''
  if (import.meta.env.PROD) {
    basePath = '../renderer/public'
  }

  // 这里通过link得方式修改主题
  link.href = `${basePath}/milkdown-themes/${themeName}/style.css`

  const html = document.documentElement

  // 移除所有主题类
  html.classList.remove('theme-normal', 'theme-normal-dark', 'theme-crepe', 'theme-crepe-dark', 'theme-frame', 'theme-frame-dark')

  // 添加新的主题类
  html.classList.add(`theme-${themeName}`)

  // 保存主题设置并更新当前主题状态
  localStorage.setItem('theme-name', themeName)
  localStorage.setItem('theme-type', themeType)
  currentThemeName.value = themeName
}

// 主题切换
function handleChangeTheme(option: ThemeOption) {
  setMilkdownTheme(option.name, option.type)
}

// 初始化主题
function initTheme() {
  const savedThemeName = localStorage.getItem('theme-name') || 'normal'
  const savedThemeType = localStorage.getItem('theme-type') as 'light' | 'dark' || 'light'

  // 应用保存的主题
  setMilkdownTheme(savedThemeName, savedThemeType)
}

// 组件挂载时初始化主题
if (typeof window !== 'undefined') {
  initTheme()
}
</script>

<template>
  <div class="ThemePageBox">
    <div class="theme-header">
      <h2>选择您喜欢的主题风格</h2>
    </div>

    <div class="theme-grid">
      <div
        v-for="option in themeOptions"
        :key="option.name"
        class="theme-card"
        :class="{ active: option.name === currentThemeName }"
        @click="handleChangeTheme(option)"
      >
        <div class="theme-preview" :style="{ backgroundColor: option.color }">
          <div class="preview-content" :class="option.type === 'dark' ? 'dark-preview' : 'light-preview'">
            <div class="preview-header"></div>
            <div class="preview-lines">
              <div class="preview-line"></div>
              <div class="preview-line"></div>
              <div class="preview-line"></div>
            </div>
          </div>
        </div>
        <div class="theme-info">
          <h3>{{ option.label }}</h3>
          <p>{{ option.description }}</p>
        </div>
      </div>
    </div>

    <div class="current-theme">
      <div class="current-theme-info">
        <h3>当前主题: {{ currentTheme.label }}</h3>
        <p>{{ currentTheme.description }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ThemePageBox {
  width: 100%;
  height: 100%;
  padding: 0 20px 20px 20px;

  .theme-header {
    margin-bottom: 24px;

    h2 {
      font-size: 20px;
      color: var(--text-color);
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: var(--text-color-2);
    }
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .theme-card {
      background: var(--background-color-2);
      border: 1px solid var(--border-color-2);
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px var(--primary-color-transparent);
      }

      .theme-preview {
        height: 140px;
        width: 100%;
        padding: 12px;

        .preview-content {
          height: 100%;
          border-radius: 4px;
          padding: 8px;

          &.light-preview {
            background-color: rgba(255, 255, 255, 0.85);
            color: #333;
          }

          &.dark-preview {
            background-color: rgba(0, 0, 0, 0.75);
            color: #eee;
          }

          .preview-header {
            height: 12px;
            width: 70%;
            background-color: currentColor;
            opacity: 0.7;
            border-radius: 4px;
            margin-bottom: 12px;
          }

          .preview-lines {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .preview-line {
              height: 8px;
              background-color: currentColor;
              opacity: 0.5;
              border-radius: 4px;

              &:nth-child(1) {
                width: 100%;
              }

              &:nth-child(2) {
                width: 85%;
              }

              &:nth-child(3) {
                width: 65%;
              }
            }
          }
        }
      }

      .theme-info {
        padding: 12px;

        h3 {
          font-size: 16px;
          color: var(--text-color);
          margin-bottom: 6px;
        }

        p {
          font-size: 13px;
          color: var(--text-color-2);
          line-height: 1.4;
        }
      }
    }
  }

  .current-theme {
    padding: 16px;
    background: var(--background-color-3);
    border-radius: 6px;

    .current-theme-info {
      h3 {
        font-size: 16px;
        color: var(--text-color);
        margin-bottom: 4px;
      }

      p {
        font-size: 14px;
        color: var(--text-color-2);
      }
    }
  }
}
</style>
