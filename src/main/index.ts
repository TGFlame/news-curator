import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../renderer/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC handlers for crawler communication
ipcMain.handle('start-crawl', async (event, config) => {
  try {
    // Call your crawler.js logic here
    console.log('Starting crawl with config:', config)
    return { success: true, message: 'Crawl started' }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('get-articles', async (event, category) => {
  try {
    // Fetch articles from your backend/cache
    console.log('Fetching articles for category:', category)
    return []
  } catch (error) {
    return { error: String(error) }
  }
})
