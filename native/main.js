const { app, BrowserWindow, protocol, net, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const ROOT = path.join(__dirname, 'app');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    let p = decodeURIComponent(new URL(req.url).pathname); if (p === '/' || p === '') p = '/index.html';
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT + path.sep)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  const win = new BrowserWindow({ width: 1100, height: 800, minWidth: 360, minHeight: 600, title: 'A&P', icon: path.join(__dirname, 'build', 'icon.png'), autoHideMenuBar: true });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.loadURL('app://ap/index.html');
});
app.on('window-all-closed', () => app.quit());
