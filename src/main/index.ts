import { app, BrowserWindow, ipcMain, dialog, protocol, globalShortcut } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { Menu } from 'electron'

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
  console.log('加载文件路径:', indexPath)
  console.log('文件是否存在:', fs.existsSync(indexPath))

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    await win.loadFile(indexPath)
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    win.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  // protocol.interceptBufferProtocol('file', (request, callback) => {
  //   try {
  //     // 如果读取的是 dist 目录下的文件 直接原样返回
  //     if (request.url.includes('dist/index.html')) {
  //       const filePath =  decodeURI(request.url.replace('file://', ''))
  //       fs.readFile(filePath, (err, data) => {
  //         if (err) {
  //           console.error('读取文件失败:', filePath, err)
  //           callback({ error: -6 }) // FILE_NOT_FOUND
  //           return
  //         }
  //         callback({ data, mimeType: 'text/html' })
  //       })
  //       return
  //     }
  //     let filePath = decodeURI(request.url.replace('file://', ''))
  //     if (process.platform === 'win32' && filePath.startsWith('/')) {
  //       filePath = filePath.slice(1)
  //     }

  //     const ext = filePath.split('.').pop()?.toLowerCase() || ''
  //     const mimeMap: Record<string, string> = {
  //       png: 'image/png',
  //       jpg: 'image/jpeg',
  //       jpeg: 'image/jpeg',
  //       gif: 'image/gif',
  //       bmp: 'image/bmp',
  //       webp: 'image/webp',
  //       svg: 'image/svg+xml',
  //     }
  //     const mimeType = mimeMap[ext] || 'application/octet-stream'

  //     fs.readFile(filePath, (err, data) => {
  //       if (err) {
  //         console.error('读取本地文件失败:', filePath, err)
  //         callback({ error: -6 }) // FILE_NOT_FOUND
  //         return
  //       }
  //       callback({ data, mimeType })
  //     })
  //   } catch (error) {
  //     console.error('拦截file协议异常:', error)
  //     callback({ error: -2 }) // FAILED
  //   }
  // })

  createWindow()
  createMenu()
})
// 文件打开对话框
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
    properties: ['openFile']
  })
  if (canceled) return null
  const filePath = filePaths[0]
  const content = fs.readFileSync(filePath, 'utf-8')
  return { filePath, content }
})

// 文件保存对话框
ipcMain.handle('dialog:saveFile', async (_event, { filePath, content }) => {
  if (!filePath) {
    const { canceled, filePath: savePath } = await dialog.showSaveDialog(win, {
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
    })
    if (canceled || !savePath) return null
    filePath = savePath
  }
  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
ipcMain.on('set-title', (_event, filePath: string | null) => {
  const title = filePath
    ? `MilkUp - ${path.basename(filePath)}`
    : 'MilkUp - Untitled'
  win.setTitle(title)
})

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            win.webContents.send('menu-open')
          }
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            win.webContents.send('menu-save')
          }
        },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
ipcMain.on('window-control', (_event, action) => {
  console.log('action::: ', action);
  if (!win) return
  switch (action) {
    case 'minimize':
      win.minimize()
      break
    case 'maximize':
      if (win.isMaximized()) win.unmaximize()
      else win.maximize()
      break
    case 'close':
      win.close()
      break
  }
})