"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    const startUrl = electron_is_dev_1.default
        ? 'http://localhost:5173'
        : `file://${path_1.default.join(__dirname, '../renderer/index.html')}`;
    mainWindow.loadURL(startUrl);
    if (electron_is_dev_1.default) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
// IPC handlers for crawler communication
electron_1.ipcMain.handle('start-crawl', async (event, config) => {
    return new Promise((resolve, reject) => {
        const crawlerProcess = (0, child_process_1.spawn)('node', ['crawler.js'], {
            cwd: __dirname,
            stdio: 'inherit'
        });
        crawlerProcess.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, message: 'Crawl completed' });
            }
            else {
                reject(new Error(`Crawler exited with code ${code}`));
            }
        });
    }).catch(error => ({
        success: false,
        error: String(error)
    }));
});
electron_1.ipcMain.handle('get-articles', async (event, category) => {
    try {
        // Fetch articles from crawler results
        const resultsPath = path_1.default.join(__dirname, '../../crawler-results.json');
        const data = await fs_1.promises.readFile(resultsPath, 'utf-8');
        const articles = JSON.parse(data);
        if (!category || category === 'all') {
            return articles;
        }
        return articles.filter((article) => article.category === category);
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
});
