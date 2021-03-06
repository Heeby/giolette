import WebSocket from "ws"
import numeral from "numeral"
import EventEmitter from "eventemitter3"
import lodash from "lodash"

let winston

const eventEmitter = new EventEmitter()
const onDeepbotMessage = (message) => {
    eventEmitter.emit("message", message)
}

export default {
    name: "DeepBot",
    id: "deepbot",
    status: "pending",
    tooltip: null,
    config: null,
    setWinston: winstonInstance => winston = winstonInstance,

    socket: null,

    init() {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                resolve()
                return
            }

            const socket = new WebSocket(`ws://localhost:${this.config.port}`)
            socket.on("open", () => {
                winston.info("Deepbot WebSocket started")
                this.socket = socket
                socket.on("message", onDeepbotMessage)
                eventEmitter.on("message", (message) => {
                    const registerResult = JSON.parse(message).msg
                    if (registerResult === "success") {
                        resolve(`Port: ${this.config.port}`)
                        eventEmitter.removeAllListeners("message")
                    } else {
                        reject(`Deepbot response: ${message}`)
                    }
                })
                socket.send(`api|register|${this.config.api_key}`)

                setTimeout(() => {
                    reject(new Error("Connecting timed out after 8 seconds"))
                }, 8000)
            })
        })
    },

    test() {
        return this.init()
    },

    getPoints(name) {
        const socket = this.socket
        return this.init().then(() => new Promise((resolve, reject) => {
            const messageListener = (message) => {
                message = message.trim()

                if (!lodash.startsWith(message, "{") && !lodash.startsWith(message, "[")) {
                   winston.debug(`Ignoring non-JSON message from DeepBot: ${message}`)
                    return
                }

                const result = JSON.parse(message)
                if (!result || !result.function || result.function !== "get_points" || !result.param || result.param.toLowerCase() !== name.toLowerCase()) {
                    winston.debug(`Ignoring wrong message from DeepBot: ${JSON.stringify(result)}`)
                    return
                }
                winston.info(`Got points feedback from DeepBot: [${name}: ${numeral(result.msg.replace(",", ".")).value()}]`)
                eventEmitter.removeListener("message", messageListener)
                resolve(numeral(result.msg.replace(",", ".")).value())
            }
            eventEmitter.on("message", messageListener)
            socket.send(`api|get_points|${name}`)
            setTimeout(() => {
                resolve(0)
            }, 8000)
        }))
    },

    addPoints(name, points) {
        return this.init().then(() => new Promise((resolve, reject) => {
            winston.info(`${name}: +${points} points on DeepBot`)
            this.socket.send(`api|add_points|${name}|${points}`)
            resolve()
        }))
    }
}
