const isDebug = global.DEBUG === false ? false : !process.argv.includes("--prod")

import {app, BrowserWindow} from "electron"
import installExtension, {REACT_DEVELOPER_TOOLS} from "electron-devtools-installer"

import path from "path"
import url from "url"
import queryString from "query-string"

import deepbotApi from "./src/apis/Deepbot"
import discordApi from "./src/apis/Discord"
import tipeeeApi from "./src/apis/Tipeee"
import twitchOauthApi from "./src/apis/TwitchOauth"
import twitchPublicApi from "./src/apis/TwitchPublic"
import browserSourceApi from "./src/apis/BrowserSource"
import websocketApi from "./src/apis/WebSocket"

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let authWindow

function createWindow() {

    if (isDebug) {
        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log("An error occurred: ", err))
    }

    global.initTwitchAuth = initTwitchAuth
    global.apis = {
        deepbot: deepbotApi,
        discord: discordApi,
        tipeee: tipeeeApi,
        twitchOauth: twitchOauthApi,
        twitchPublic: twitchPublicApi,
        browserSource: browserSourceApi,
        websocket: websocketApi
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 780,
        height: 660,
        minWidth: 500,
        minHeight: 300,
        icon: path.join(__dirname, "dist/firefox_app_128x128.png"),
        darkTheme: true,
        autoHideMenuBar: true,
        webPreferences: {
            devTools: isDebug,
            defaultEncoding: "UTF-8",
            backgroundThrottling: false
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "dist/index.html"),
        protocol: "file:"
    }))

    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

}

const initTwitchAuth = () => {
    authWindow = new BrowserWindow({
        parent: mainWindow,
        width: 480,
        height: 480,
        minWidth: 480,
        minHeight: 480,
        icon: path.join(__dirname, "dist/firefox_app_128x128.png"),
        darkTheme: true,
        autoHideMenuBar: true,
        nodeIntegration: false,
        webPreferences: {
            defaultEncoding: "UTF-8"
        }
    })

    authWindow.loadURL(url.format({
        protocol: "https",
        host: "api.twitch.tv",
        pathname: "/kraken/oauth2/authorize",
        query: {
            client_id: "19hxab1r53jujqh1nt6utpc046axu9",
            redirect_uri: "http://localhost",
            response_type: "token id_token",
            scope: "openid channel_read channel_subscriptions"
        }
    }))

    authWindow.webContents.on("will-navigate", function (event, url) {
        getTwitchAuth(url)
    })

    authWindow.webContents.on("did-get-redirect-request", function (event, oldUrl, newUrl) {
        getTwitchAuth(newUrl)
    })
}

function getTwitchAuth(redirectUrl) {
    const {host, hash} = url.parse(redirectUrl)

    if (host !== "localhost") {
        return
    }

    const {access_token, id_token} = queryString.parse(hash)

    if (access_token) {
        apis.twitchOauth.accessToken = access_token
        apis.twitchOauth.idToken = id_token
        console.log(`access_token: ${access_token}`)
        console.log(`id_token: ${id_token}`)
        authWindow.destroy()
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed.
app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit()
    }
})
