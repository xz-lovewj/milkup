// ipcBridge.ts

import { dialog, ipcMain } from 'electron'
import * as fs from 'fs'
import path from 'path'

// 所有 on 类型监听
export function registerIpcOnHandlers(win: Electron.BrowserWindow) {
  ipcMain.on('set-title', (_event, filePath: string | null) => {
    const title = filePath
      ? `MilkUp - ${path.basename(filePath)}`
      : 'MilkUp - Untitled'
    win.setTitle(title)
  })
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
}

// 所有 handle 类型监听
export function registerIpcHandleHandlers(win: Electron.BrowserWindow) {
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
}
