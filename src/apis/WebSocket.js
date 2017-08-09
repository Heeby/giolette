import WebSocket from "ws"

export default {
    name: "WebSocket",
    id: "websocket",
    status: "pending",
    tooltip: null,

    websocketServer: null,

    init() {
        return new Promise((resolve, reject) => {

            if (this.websocketServer) {
                console.log("Skipping WebSocket.init(): websocketServer already initialized")
                resolve()
            }

            const websocketServer = new WebSocket.Server({port: 24491})

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

    testWebsocket() {
        return new Promise((resolve, reject) => {

            const websocket = new WebSocket("ws://localhost:24491")

            websocket.on("open", () => {
                resolve("Working WebSocket on port 24491")
            })

        })
    },

    test() {
        return this.init()
            .then(this.testWebsocket)
    }
}
