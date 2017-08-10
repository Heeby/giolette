import WebSocket from "ws"

export default {
    name: "Deepbot",
    id: "deepbot",
    status: "pending",
    tooltip: null,
    config: null,

    socket: null,

    init() {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                resolve()
            }

            const socket = new WebSocket(`ws://localhost:${this.config.port}`)
            socket.on("open", () => {
                console.log("Deepbot WebSocket started")
                this.socket = socket
                ws.on("message", (message) => {
                    const registerResult = JSON.parse(message).msg
                    if (msg === "success") {
                        resolve(`Port: ${this.config.port}`)
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
        return this.init().then(() => new Promise((resolve, reject) => {

        }))
    }
}
