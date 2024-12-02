const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// 开发环境下启用热重载
if (isDev) {
    try {
        require('electron-reloader')(module, {
            debug: true,
            watchRenderer: true
        });
    } catch (_) { console.log('Error'); }
}

// 添加 IPC 处理
ipcMain.on('close-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
        win.close();
    }
});

// 添加文件保存处理
ipcMain.on('save-file', async (event, { content, defaultPath }) => {
    const win = BrowserWindow.getFocusedWindow();
    const { filePath } = await dialog.showSaveDialog(win, {
        defaultPath,
        filters: [
            { name: 'Markdown', extensions: ['md'] }
        ]
    });

    if (filePath) {
        fs.writeFileSync(filePath, content);
    }
});

function createWindow() {
    const win = new BrowserWindow({
        width: 750,
        height: 431,
        resizable: true,
        minWidth: 750,
        maxWidth: 750,
        minHeight: 431,
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const loadingWin = new BrowserWindow({
        width: 250,
        height: 250,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    loadingWin.loadFile('loading.html');
    loadingWin.center();

    win.loadFile('index.html');
    win.setMenu(null);

    win.once('ready-to-show', () => {
        setTimeout(() => {
            win.show();
            loadingWin.close();
        }, 1000);
    });

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '开发者工具',
            click: () => {
                win.webContents.toggleDevTools();
            }
        }
    ]);

    win.webContents.on('context-menu', (e) => {
        if (isDev) {
            contextMenu.popup();
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});