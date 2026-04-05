"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    startCrawl: (config) => electron_1.ipcRenderer.invoke('start-crawl', config),
    getArticles: (category) => electron_1.ipcRenderer.invoke('get-articles', category),
    onCrawlProgress: (callback) => electron_1.ipcRenderer.on('crawl-progress', callback),
    removeCrawlListener: () => electron_1.ipcRenderer.removeAllListeners('crawl-progress'),
});
