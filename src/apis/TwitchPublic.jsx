import request from "request"

const twitchRequest = request.defaults({
    json: true,
    baseUrl: "https://api.twitch.tv/kraken/",
    jar: true,
    headers: {
        Accept: "application/vnd.twitchtv.v5+json",
        "Client-ID": "19hxab1r53jujqh1nt6utpc046axu9"
    }
})

const tmiRequest = request.defaults({
    json: true,
    baseUrl: "http://tmi.twitch.tv/",
    jar: true,
    headers: {
        Accept: "application/vnd.twitchtv.v5+json",
        "Client-ID": "19hxab1r53jujqh1nt6utpc046axu9"
    }
})

export default {
    name: "Twitch Kraken",
    id: "twitch_public",
    status: "pending",
    tooltip: null,
    config: null,

    init() {

    },

    test() {
        return new Promise((resolve, reject) => {

            const twitchUser = "j4idn"

            twitchRequest(`users?login=${twitchUser}`, (error, response, body) => {

                if (error) {
                    reject(error)
                    return
                }

                resolve(`<b>Status:</b> ${response.statusCode} ${response.statusMessage}<br><b>Test URL:</b> ${response.request.uri.href}`)

            })

        })
    },

    getAvatar(name) {
        return new Promise((resolve, reject) => {
            twitchRequest(`users?login=${name}`, (error, response, body) => {

                const avatar = (!error && response.statusCode === 200 && body.users[0] && body.users[0].logo)
                    ? body.users[0].logo
                    : "https://raw.githubusercontent.com/Jaid/giolette/master/public/icon_1080.png"
                const displayName = (!error && response.statusCode === 200 && body.users[0] && body.users[0].display_name)
                    ? body.users[0].display_name
                    : `"${name}"`
                resolve({avatar: avatar, displayName: displayName})

            })
        })
    },

    getChatters() {
        const channelName = this.config.channel_name
        return new Promise((resolve, reject) => {
            tmiRequest(`group/user/${channelName}/chatters`, (error, response, body) => {
                if (error) {
                    console.log(`Twitch GET chatters error: ${error}`)
                    return resolve([])
                }
                if (!body || !body.chatters || !body.chatters.moderators) {
                    console.log(`Twitch GET chatters error: body is ${body}`)
                    return resolve([])
                }
                return resolve(body.chatters.moderators.concat(body.chatters.viewers))
            })
        })
    }
}
