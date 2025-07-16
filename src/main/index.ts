import { app, BrowserWindow, globalShortcut } from 'electron'
import * as path from 'path'
import { registerIpcHandleHandlers, registerIpcOnHandlers } from './ipcBridge'
import createMenu from './menu'

let win: BrowserWindow

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
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

app.whenReady().then(async () => {
  await createWindow()
  createMenu(win)
  registerIpcOnHandlers(win)
  registerIpcHandleHandlers(win)
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})