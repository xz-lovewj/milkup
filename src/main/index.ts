import { app, BrowserWindow, globalShortcut } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { registerIpcHandleHandlers, registerIpcOnHandlers } from './ipcBridge'
import createMenu from './menu'

let win: BrowserWindow

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden', // ✅ macOS 专属
    icon: path.join(__dirname, '../assets/icons/milkup.ico'),
    webPreferences: {
      sandbox: false,
      preload: path.resolve(__dirname, "../../dist-electron/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // 允许加载本地文件
    }
  })
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win) win.webContents.openDevTools()
  })
  const indexPath = path.join(__dirname, '../../dist', 'index.html')

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    await win.loadFile(indexPath)
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    win.webContents.openDevTools()
  }
}
function sendLaunchFileIfExists() {
  const fileArg = process.argv.find(arg => arg.endsWith('.md') || arg.endsWith('.markdown'))

  if (fileArg) {
    const absolutePath = path.resolve(fileArg)
    if (fs.existsSync(absolutePath)) {
      const content = fs.readFileSync(absolutePath, 'utf-8')
      win.webContents.send('open-file-at-launch', {
        filePath: absolutePath,
        content,
      })
    } else {
      console.warn('[main] 文件不存在:', absolutePath)
    }
  }
}

app.whenReady().then(async () => {
  await createWindow()
  createMenu(win)
  sendLaunchFileIfExists()
  registerIpcOnHandlers(win)
  registerIpcHandleHandlers(win)
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})