const { app, BrowserWindow, clipboard, ipcMain } = require('electron')
const path = require('node:path')

ipcMain.handle('clipboard:writeText', (_event, text) => {
  const value = String(text ?? '')
  clipboard.writeText(value, 'clipboard')
  return clipboard.readText('clipboard') === value
})

ipcMain.handle('clipboard:readText', () => {
  return clipboard.readText('clipboard')
})

function createWindow() {
  const appIconPath = path.join(__dirname, 'icon.png')

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    icon: appIconPath,
    autoHideMenuBar: true,
    backgroundColor: '#050A14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
  win.loadFile(indexPath)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
