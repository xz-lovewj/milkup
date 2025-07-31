import { ref } from 'vue'

// 定义支持的主题类型
type ThemeType = 'light' | 'dark'

// 扩展主题支持
const supportedThemes = [
  'normal', 'normal-dark',
  'crepe', 'crepe-dark',
  'frame', 'frame-dark'
]

const themeType = ref<ThemeType>('light')
const themeName = ref<string>('normal')

// 根据主题名称和类型应用主题
function applyTheme(name: string, type: ThemeType) {
  themeName.value = name
  themeType.value = type
  
  const html = document.documentElement
  
  // 移除所有主题类
  html.classList.remove('theme-normal', 'theme-normal-dark', 'theme-crepe', 'theme-crepe-dark', 'theme-frame', 'theme-frame-dark')
  
  // 添加新的主题类
  html.classList.add(`theme-${name}`)
  
  // 应用Milkdown编辑器主题
  switchMilkTheme(name)
  
  // 保存主题设置
  localStorage.setItem('theme-name', name)
  localStorage.setItem('theme-type', type)
}

// 切换Milkdown编辑器主题
function switchMilkTheme(theme: string) {
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
  
  // 设置Milkdown编辑器主题
  link.href = `${basePath}/milkdown-themes/${theme}/style.css`
}

export default function useTheme() {
  // 初始化：读取本地主题设置
  if (typeof window !== 'undefined') {
    const savedThemeName = localStorage.getItem('theme-name')
    const savedThemeType = localStorage.getItem('theme-type') as ThemeType
    
    if (savedThemeName && (savedThemeType === 'light' || savedThemeType === 'dark')) {
      // 应用保存的主题
      applyTheme(savedThemeName, savedThemeType)
    } else {
      // 默认主题
      applyTheme('normal', 'light')
    }
  }

  // 提供方法
  return {
    supportedThemes,
    themeType,
    themeName,
    setTheme: applyTheme
  }
}
