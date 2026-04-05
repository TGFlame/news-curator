import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  startCrawl: (config: any) => ipcRenderer.invoke('start-crawl', config),
  getArticles: (category: string) => ipcRenderer.invoke('get-articles', category),
  onCrawlProgress: (callback: (event: any, data: any) => void) =>
    ipcRenderer.on('crawl-progress', callback),
  removeCrawlListener: () => ipcRenderer.removeAllListeners('crawl-progress'),
})
