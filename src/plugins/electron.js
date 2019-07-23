export const electron = require('electron')
export const remote = electron.remote
export const shell = electron.shell
export const currentWindow = remote.getCurrentWindow()
export const versions = process.versions

export const close = () => {
  currentWindow.close()
}

export const maximize = () => {
  currentWindow.isMaximized() ? currentWindow.restore() : currentWindow.maximize()
}

export const minimize = () => {
  currentWindow.minimize()
}

export const devTools = () => {
  currentWindow.webContents.openDevTools()
}

export const openUrl = (url) => {
  shell.openExternal(url)
}

export const restart = () => {
  remote.app.relaunch()
  remote.app.exit(0)
}
