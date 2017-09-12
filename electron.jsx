const isDebug = global.DEBUG === true ? true : process.env.NODE_ENV !== "production"

import {app, BrowserWindow, Menu, Tray} from "electron"
import installExtension, {REACT_DEVELOPER_TOOLS} from "electron-devtools-installer"

import fs from "fs-extra"
import path from "path"
import url from "url"
import yaml from "js-yaml"

import deepbotApi from "./src/apis/Deepbot"
import discordApi from "./src/apis/Discord"
import tipeeeApi from "./src/apis/Tipeee"
import twitchPublicApi from "./src/apis/TwitchPublic"
import browserSourceApi from "./src/apis/BrowserSource"
import websocketApi from "./src/apis/WebSocket"
import winston from "winston"
import moment from "moment"
import lodash from "lodash"

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray

const configDir = path.resolve(".", "giolette-config")

winston.configure({
    level: "debug",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: path.resolve(configDir, "log.txt"),
            json: false,
            formatter: options => `[${moment().format("DD.MM.YYYY hh:mm:ss")} ${lodash.padStart(options.level.toUpperCase(), 7)}] ${options.message || ""}${options.meta && Object.keys(options.meta).length ? " " + JSON.stringify(options.meta) : ""}`
        })
    ]
})

winston.info(`Working in: ${configDir}`)

function createDefaultFile(filename) {
    return new Promise((resolve, reject) => {

        const outputFile = path.resolve(configDir, filename)

        if (fs.existsSync(outputFile)) {
            winston.info(`File ${filename} found!`)
            resolve()
            return
        }

        const defaultFile = path.resolve(`config/defaults/${filename}`)
        winston.info(`${defaultFile} -> ${outputFile}`)
        fs.copy(path.resolve(__dirname, `config/defaults/${filename}`), outputFile, {
            overwrite: true,
            dereference: true
        }, resolve)
        global.errorMessage = `I created ${outputFile} for you! Please edit this file and start me again!`

    })
}

function createWindow() {

    const prizesFile = path.resolve(configDir, "prizes.yml")
    const chatPrizesFile = path.resolve(configDir, "chat_prizes.yml")
    const configFile = path.resolve(configDir, "config.yml")
    const prizes = yaml.safeLoad(fs.readFileSync(prizesFile)).filter(prize => prize.weight > 0)
    const chatPrizes = yaml.safeLoad(fs.readFileSync(chatPrizesFile)).filter(prize => prize.weight > 0)
    const config = yaml.safeLoad(fs.readFileSync(configFile))

    if (!prizes) {
        global.errorMessage = global.errorMessage || "Could not load prizes.yml"
    }

    if (!config) {
        global.errorMessage = global.errorMessage || "Could not load config.yml"
    }

    if (isDebug) {
        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => winston.info(`Added Extension:  ${name}`))
            .catch((err) => winston.error("An error occurred: ", err))
    }

    global.winston = winston
    global.prizes = prizes
    global.chatPrizes = chatPrizes
    global.apis = {
        deepbot: deepbotApi,
        discord: discordApi,
        tipeee: tipeeeApi,
        twitchPublic: twitchPublicApi,
        browserSource: browserSourceApi,
        websocket: websocketApi
    }

    let weightSum = 0.0
    prizes.forEach(prize => weightSum += prize.weight)
    prizes.forEach(prize => prize.weightNormalized = prize.weight / weightSum)

    weightSum = 0.0
    chatPrizes.forEach(prize => weightSum += prize.weight)
    chatPrizes.forEach(prize => prize.weightNormalized = prize.weight / weightSum)

    Object.keys(global.apis).forEach((api) => {
        global.apis[api].config = config[api]
        global.apis[api].setWinston(winston)
    })

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 815,
        height: 865,
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
        winston.info("Closed")
    })

    mainWindow.on("minimize", event => {
        event.preventDefault()
        mainWindow.hide()
        winston.debug("Minized to tray");
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
    tray.on("click", () => {
        mainWindow.show()
        winston.debug("Opened from tray");
    })

    winston.debug("Config", config)
    winston.debug(`${prizes.length} prizes: ${prizes.map(prize => prize.name).join(", ")}`)
    winston.debug(`${chatPrizes.length} chat Prizes: ${chatPrizes.map(prize => prize.name).join(", ")}`)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    fs.mkdirsSync(configDir)
    createDefaultFile("config.yml")
        .then(() => createDefaultFile("prizes.yml"))
        .then(() => createDefaultFile("chat_prizes.yml"))
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
