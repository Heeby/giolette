import WebSocket from "ws"

export default {
    name: "Deepbot Debug",
    id: "deepbot",
    status: "pending",
    tooltip: null,
    config: null,

    socket: null,

    init() {
        return new Promise((resolve, reject) => {
            resolve(`Port: ${this.config.port}`)
        })
    },

    test() {
        return this.init()
    },

    getPoints(name) {
        return this.init().then(() => new Promise((resolve, reject) => {
            resolve(50)
        }))
    }
}
