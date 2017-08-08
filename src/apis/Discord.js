import {Client as DiscordClient, RichEmbed} from "discord.js"

export default {
    name: "Discord",
    id: "discord",
    status: "pending",
    tooltip: null,

    // Set in init()
    discordBot: null,
    server: null,

    // Temp
    serverId: "202479804262514688",

    init() {
        return new Promise((resolve, reject) => {

            if (this.discordBot) {
                console.log("Skipping Discord.init: discordBot already initialized")
                resolve()
            }

            const discordBot = new DiscordClient()

            discordBot.on("ready", () => {
                console.log("Discord bot is ready!")
                this.discordBot = discordBot
                this.server = this.discordBot.guilds.find("id", this.serverId)
                resolve("Ready!")
            })
            discordBot.on("warn", (msg) => {
                console.log(`Discord bot warning: ${msg}`)
            })

            discordBot.login("MzQ0MzA1MDQxMjIzNzEyNzcw.DGrSkQ.X8bnwvTW2vYam8yifLihNi2JkEo")
            console.log("Logging in as Discord bot...")

            setTimeout(() => {
                reject(new Error("Connecting timed out after 8 seconds"))
            }, 8000)

        })
    },

    sendTestMessage(discordBot, server) {
        return new Promise((resolve, reject) => {

            if (!discordBot) {
                reject("discordBot is not set in Discord.js!")
            }

            console.log(`servers: ${discordBot.guilds.keyArray()}`)
            if (!server) {
                reject(`Giolette is not a member of Discord server with ID ${discordBot.guilds.serverId}`)
            }

            const testChannel = server.channels.find("name", "giolette_specials")
            testChannel.send({
                embed: {
                    color: 7457935,
                    description: "(Test)",
                    timestamp: new Date(),
                    footer: {
                        icon_url: "https://raw.githubusercontent.com/Jaid/giolette/master/src/res/images/prizes/generic.png",
                        text: "Giolette"
                    }
                }
            }).then(resolve)
        })
    },

    deleteTestMessage(server, message) {
        return new Promise((resolve, reject) => {
            if (message.id) {
                message.delete()
                this.setStatus("Testing...")
                resolve(`Discord server: ${server.name}<br>Test channel: #${message.channel.name}<br>Test message ID: ${message.id}`)
            }
            reject(new Error("Could not identify sent test message"))
        })
    },

    test() {
        this.discordBot = null
        return this.init()
            .then(() => this.sendTestMessage(this.discordBot, this.server))
            .then((message) => this.deleteTestMessage(this.server, message))
    },

    setStatus(status) {
        if (!this.discordBot) {
            console.log(`Called setStatus(), but discordBot is ${this.discordBot}`);
        }

        this.discordBot.user.setGame(status)
    },

    clearStatus() {
        this.setStatus(null)
    }
}
