import WebSocket from "ws"
import request from "request"

const twitchRequest = request.defaults({
    baseUrl: "https://api.twitch.tv/kraken/",
    encoding: "utf-8",
    gzip: true,
    jar: true,
    json: true,
    headers: {
        Accept: "application/vnd.twitchtv.v5+json",
        "Client-ID": "19hxab1r53jujqh1nt6utpc046axu9"
    }
})

let socket = null

export default {
    name: "Twitch PubSub",
    id: "twitch_oauth",
    status: "pending",
    tooltip: null,
    config: null,

    // Set in electron.jsx
    accessToken: null,
    idToken: null,

    // Set in setupTwitchIdPromise
    twitchId: null,
    twitchName: null,
    twitchEmail: null,

    init() {
        const setupTwitchIdPromise = new Promise((resolve, reject) => {
            if (this.twitchId) {
                console.log("Skipping setupTwitchIdPromise: twitchId already initialized")
                resolve()
                return
            }
            twitchRequest("channel", {
                headers: {
                    Authorization: `OAuth ${this.accessToken}`
                }
            }, (error, response, body) => {

                if (error) {
                    reject(error)
                    return
                }

                this.twitchId = body._id
                this.twitchName = body.display_name
                this.twitchEmail = body.email

                console.log(`twitchId = ${this.twitchId}`)
                console.log(`twitchName = ${this.twitchName}`)
                console.log(`twitchEmail = ${this.twitchEmail}`)

                resolve(response.statusMessage)

            })
        })

        const setupPubsub = new Promise((resolve, reject) => {
            if (socket) {
                console.log("Skipping setupPubsub: socket already initialized")
                resolve()
            }
            socket = new WebSocket("wss://pubsub-edge.twitch.tv")
            socket.on("open", () => {
                console.log("PubSub WebSocket started")
                resolve(socket)
            })
        })

        return Promise.all([setupTwitchIdPromise, setupPubsub])
    },

    testOauth(accessToken, twitchId, twitchName) {
        return new Promise((resolve, reject) => {
            if (!twitchId) {
                reject(new Error(`twitchId is ${twitchId}`))
            }
            twitchRequest(`channels/${twitchId}/subscriptions`, {
                headers: {
                    Authorization: `OAuth ${accessToken}`
                }
            }, (error, response, body) => {
                if (error) {
                    reject(error)
                }
                const subscribers = body.status === 422 ? 0 : body._total
                console.log(`${twitchName} has ${subscribers} total subscribers`)
                resolve(`Twitch Name: ${twitchName}<br>Twitch ID: ${twitchId}<br>Total subscribers: ${subscribers}`)
            })
        })
    },

    testPubsub() {
        return new Promise((resolve, reject) => {
            socket.on("message", (message) => {
                if (JSON.parse(message).type === "PONG") {
                    resolve(`PubSub PING response: ${message}`)
                } else {
                    reject(`PubSub PING response: ${message}`)
                }
            })
            console.log("Sending PING to PubSub...")
            socket.send(JSON.stringify({type: "PING"}))
        })
    },

    test() {
        this.twitchId = null
        socket = null
        return this.init()
            .then(() => Promise.all([
                this.testOauth(this.accessToken, this.twitchId, this.twitchName),
                this.testPubsub()
            ]))
    }
}
