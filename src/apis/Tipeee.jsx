import io from "socket.io-client"

let winston

export default {
    name: "TipeeeStream",
    id: "tipeee",
    status: "pending",
    tooltip: null,
    config: null,
    reconnectListener: null,
    setWinston: winstonInstance => winston = winstonInstance,

    socket: null,

    init() {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                resolve()
                return
            }

            const socket = io("https://sso.tipeeestream.com:4242")
            socket.on("connect", () => {
                winston.info("Connected to Tipeee socket")
                this.socket = socket
                resolve("Seems to work")
            })
            socket.on("reconnect", attempts => {
                winston.info(`Tipeee socket client reconnected after ${attempts} attempts`)
                socket.emit("join-room", {room: this.config.api_key, username: this.config.username})
                this.reconnectListener(attempts)
            })
            socket.on("reconnect_error", error => {
                winston.warn("Tipeee socket client reconnection failed", error)
            })
            socket.emit("join-room", {room: this.config.api_key, username: this.config.username})
        })
    },

    test() {
        return this.init()
    },

    addListener(listener) {
        return this.init()
            .then(() => this.socket.on("new-event", listener))
    },

    setReconnectListener(listener) {
        this.reconnectListener = listener
    }
}
