const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 850,
    minHeight: 600,
    title: 'Endly - Modern Cross-Platform API Client',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#0b0f17',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Disables CORS restrictions for desktop API client testing
    },
    titleBarStyle: 'hiddenInset', // Sleek macOS titlebar with native window traffic lights
    trafficLightPosition: { x: 16, y: 14 },
    autoHideMenuBar: true,
  });

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(__dirname, 'icon.png'));
  }

  const indexPath = path.join(__dirname, '../dist/index.html');
  win.loadFile(indexPath);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
