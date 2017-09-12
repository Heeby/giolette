import WebSocket from "ws"

let winston

export default {
    name: "WebSocket",
    id: "websocket",
    status: "pending",
    tooltip: null,
    setWinston: winstonInstance => winston = winstonInstance,

    websocketServer: null,

    init() {
        const port = this.config.port
        return new Promise((resolve, reject) => {

            if (this.websocketServer) {
                resolve()
                return
            }

            const websocketServer = new WebSocket.Server({port: port})

            websocketServer.broadcast = function broadcast(data) {
                websocketServer.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(data)
                    }
                })
            }

            this.websocketServer = websocketServer
            resolve("Working")
        })

    },

    testWebsocket(config) {
        return new Promise((resolve, reject) => {

            const websocket = new WebSocket(`ws://localhost:${config.port}`)

            websocket.on("open", () => {
                resolve(`Working WebSocket on port ${config.port}`)
            })

        })
    },

    test() {
        return this.init()
            .then(() => this.testWebsocket(this.config))
    },

    send(spin) {
        return this.init()
            .then(() => this.websocketServer.broadcast(JSON.stringify(spin)))
    }
}
