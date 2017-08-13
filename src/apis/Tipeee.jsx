import io from "socket.io-client"

export default {
    name: "TipeeeStream",
    id: "tipeee",
    status: "pending",
    tooltip: null,
    config: null,
    socket: null,

    init() {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                resolve()
                return
            }

            const socket = io("https://sso.tipeeestream.com:4242")
            socket.on("connect", () => {
                console.log("Connected to Tipeee socket")
                this.socket = socket
                resolve("Seems to work")
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
    }
}
