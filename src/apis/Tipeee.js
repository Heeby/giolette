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
                console.log("Skipping Tipeee.init(): socket already initialized")
                resolve()
                return
            }

            const socket = io("https://sso.tipeeestream.com:4242")
            socket.on("connect", () => {
                console.log("Connected to Tipeee socket")
                socket.emit("join-room", {room: this.config.api_key, username: this.config.username})
                resolve("Seems to work")
            })
        })
    },

    test() {
        return this.init()
    }
}
