import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'

interface Article {
  category: string
  url: string
  title: string
  description: string
  author: string
  publishDate: string
  body: string
}

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
  return new Promise((resolve, reject) => {
    const crawlerProcess = spawn('node', ['crawler.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    })
    
    crawlerProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, message: 'Crawl completed' })
      } else {
        reject(new Error(`Crawler exited with code ${code}`))
      }
    })
  }).catch(error => ({
    success: false,
    error: String(error)
  }))
})

ipcMain.handle('get-articles', async (event, category) => {
  try {
    // Fetch articles from crawler results
    const resultsPath = path.join(__dirname, '../../crawler-results.json')
    const data = await fs.readFile(resultsPath, 'utf-8')
    const articles: Article[] = JSON.parse(data)
    
    if (!category || category === 'all') {
      return articles
    }
    
    return articles.filter((article: Article) => article.category === category)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
})
