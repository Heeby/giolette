import request from "request"

const twitchRequest = request.defaults({
    json: true,
    baseUrl: "https://api.twitch.tv/kraken/",
    jar: true,
    headers: {
        "Client-ID": "19hxab1r53jujqh1nt6utpc046axu9",
        "Accept": "application/vnd.twitchtv.v5+json"
    }
})

export default {
    name: "Twitch Kraken",
    id: "twitch_public",
    status: "pending",
    tooltip: null,

    init() {

    },

    test() {
        return new Promise((resolve, reject) => {

            const twitchUser = "j4idn"

            twitchRequest(`users?login=${twitchUser}`, (error, response, body) => {

                if (error) {
                    reject(error)
                }

                resolve(`<b>Status:</b> ${response.statusCode} ${response.statusMessage}<br><b>Test URL:</b> ${response.request.uri.href}`)

            })

        })
    }
}
