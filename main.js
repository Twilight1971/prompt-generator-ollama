const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: '#0d0d12',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile('index.html');
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

function normalizeServerUrl(value) {
  let raw = String(value || 'http://127.0.0.1:11434').trim();
  if (!/^https?:\/\//i.test(raw)) raw = `http://${raw}`;
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Ungültige Ollama-Serveradresse.');
  }
  return url.origin;
}

async function ollamaRequest(serverUrl, endpoint, options) {
  let response;
  try {
    response = await fetch(`${normalizeServerUrl(serverUrl)}${endpoint}`, options);
  } catch {
    throw new Error('Ollama ist nicht erreichbar. Bitte Ollama starten und erneut versuchen.');
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || `HTTP ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(data.error || `Ollama-Fehler ${response.status}`);
  }
  return data;
}

ipcMain.handle('ollama:status', (_event, serverUrl) => ollamaRequest(serverUrl, '/api/tags'));
ipcMain.handle('ollama:model-info', (_event, serverUrl, model) => ollamaRequest(serverUrl, '/api/show', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model })
}));

ipcMain.handle('ollama:chat', (_event, payload) => {
  const model = String(payload?.model || '').trim();
  const serverUrl = payload?.serverUrl;
  const prompt = String(payload?.prompt || '');
  const image = String(payload?.image || '');
  const schema = payload?.schema && typeof payload.schema === 'object' ? payload.schema : null;
  if (!model || !prompt) throw new Error('Modell oder Prompt fehlt.');
  if (model.length > 200 || prompt.length > 100000 || image.length > 30_000_000) {
    throw new Error('Die Ollama-Anfrage ist zu groß.');
  }

  return ollamaRequest(serverUrl, '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      format: schema || 'json',
      options: { temperature: 0.4, num_predict: 4096 },
      messages: [{
        role: 'user',
        content: prompt,
        ...(image ? { images: [image] } : {})
      }]
    })
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
