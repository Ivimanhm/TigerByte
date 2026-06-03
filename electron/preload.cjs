const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('tigerbyteDesktop', {
  isDesktop: true,
  copyText: (text) => ipcRenderer.invoke('clipboard:writeText', text),
  readText: () => ipcRenderer.invoke('clipboard:readText'),
})
