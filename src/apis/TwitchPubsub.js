import WebSocket from "ws"

let socket = null

export default {
    name: "Twitch PubSub",
    id: "twitch_oauth",
    status: "pending",
    tooltip: null,

    init(callback) {
        if (socket) {
            callback()
            return
        }
        socket = new WebSocket("wss://pubsub-edge.twitch.tv")

        socket.on("open", callback)
    },

    test() {
        return new Promise((resolve, reject) => {
            this.init(() => {

                socket.send(JSON.stringify({type: "PING"}))

                socket.on("message", (message) => {
                    console.log("MSG: " + message)
                })

                reject(new Error("TOOD"))


            })
        })
    }
}
