const { app, BrowserWindow, screen, shell } = require('electron')
const serve = require('electron-serve')
const path = require('path')
const contextMenu = require('electron-context-menu')

const baseUrl = 'https://app24.sealogs.com/'
const appUrl = 'app://-/'
// Setup context menu
contextMenu({
    showSaveImageAs: true,
    showSelectAll: true,
    showCopyLink: false,
    shouldShowMenu: (event, params) => {
        return params.linkURL && params.mediaType === 'none'
    },
    append: (defaultActions, params, browserWindow) => {
        const menuItems = []
        if (params.linkURL) {
            menuItems.push({
                label: 'Copy Link',
                click: () => {
                    const modifiedLink = params.linkURL.replace(appUrl, baseUrl)
                    const { clipboard } = require('electron')
                    clipboard.writeText(modifiedLink)
                },
            })
            menuItems.push({
                label: 'Open Link In Default Browser',
                click: () => {
                    const modifiedLink = params.linkURL.replace(appUrl, baseUrl)
                    shell.openExternal(modifiedLink)
                },
            })
        }
        return menuItems
    },
})

const appServe = serve({
    directory: path.join(__dirname, './out'),
})

const createWindow = () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const win = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    appServe(win).then(() => {
        win.loadURL('app://-')
    })

    if (!app.isPackaged) {
        win.webContents.openDevTools()
        win.webContents.on('did-fail-load', (e, code, desc) => {
            win.webContents.reloadIgnoringCache()
        })
    }
}

app.on('ready', () => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
