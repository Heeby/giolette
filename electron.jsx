const isDebug = global.DEBUG === true ? true : process.env.NODE_ENV !== "production"

import {app, BrowserWindow, Menu, Tray} from "electron"
import installExtension, {REACT_DEVELOPER_TOOLS} from "electron-devtools-installer"

import fs from "fs-extra"
import path from "path"
import url from "url"
import queryString from "query-string"
import yaml from "js-yaml"

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
let tray

const configDir = path.resolve(".", "giolette-config")
console.log(`Working in: ${configDir}`)

function createDefaultFile(filename) {
    return new Promise((resolve, reject) => {

        const outputFile = path.resolve(configDir, filename)

        if (fs.existsSync(outputFile)) {
            console.log(`File ${filename} found!`)
            resolve()
            return
        }

        const defaultFile = path.resolve(`config/defaults/${filename}`)
        console.log(`${defaultFile} -> ${outputFile}`)
        fs.copy(path.resolve(__dirname, `config/defaults/${filename}`), outputFile, {
            overwrite: true,
            dereference: true
        }, resolve)
        global.errorMessage = `I created ${outputFile} for you! Please edit this file and start me again!`

    })
}

function createWindow() {

    const prizesFile = path.resolve(configDir, "prizes.yml")
    const configFile = path.resolve(configDir, "config.yml")
    const prizes = yaml.safeLoad(fs.readFileSync(prizesFile)).filter(prize => prize.weight > 0)
    const config = yaml.safeLoad(fs.readFileSync(configFile))

    if (!prizes) {
        global.errorMessage = global.errorMessage || "Could not load prizes.yml"
    }

    if (!config) {
        global.errorMessage = global.errorMessage || "Could not load config.yml"
    }

    if (isDebug) {
        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log("An error occurred: ", err))
    }

    global.prizes = prizes
    global.initTwitchAuth = initTwitchAuth
    global.apis = {
        deepbot: deepbotApi,
        discord: discordApi,
        tipeee: tipeeeApi,
        //    twitchOauth: twitchOauthApi,
        twitchPublic: twitchPublicApi,
        browserSource: browserSourceApi,
        websocket: websocketApi
    }

    let weightSum = 0.0
    prizes.forEach(prize => weightSum += prize.weight)
    prizes.forEach(prize => prize.weightNormalized = prize.weight / weightSum)

    Object.keys(global.apis).forEach((api) => {
        global.apis[api].config = config[api]
    })

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 720,
        height: 760,
        minWidth: 500,
        minHeight: 300,
        icon: path.join(__dirname, "dist/firefox_app_128x128.png"),
        darkTheme: true,
        autoHideMenuBar: true,
        webPreferences: {
            devTools: true,
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
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    mainWindow.on("minimize", event => {
        event.preventDefault()
        mainWindow.hide()
    })

    tray = new Tray(path.join(__dirname, "dist/favicon-32x32.png"))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Quit",
            click: () => {
                app.isQuiting = true
                app.quit()
            }
        }
    ])
    tray.setToolTip("gioGoennung")
    tray.setContextMenu(contextMenu)
    tray.on("click", event => {
        mainWindow.show()
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
        title: "Login with Twitch",
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
app.on("ready", () => {
    fs.mkdirsSync(configDir)
    createDefaultFile("config.yml")
        .then(() => createDefaultFile("prizes.yml"))
        .then(() => createWindow())
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit()
    }
})
