const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ollamaDesktop', {
  status: serverUrl => ipcRenderer.invoke('ollama:status', serverUrl),
  modelInfo: (serverUrl, model) => ipcRenderer.invoke('ollama:model-info', serverUrl, model),
  chat: payload => ipcRenderer.invoke('ollama:chat', payload)
});
