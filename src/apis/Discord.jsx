import {Client as DiscordClient} from "discord.js"

let winston

export default {
    name: "Discord",
    id: "discord",
    status: "pending",
    tooltip: null,
    config: null,
    setWinston: winstonInstance => winston = winstonInstance,

    // Set in init()
    discordBot: null,
    server: null,

    init() {
        return new Promise((resolve, reject) => {

            if (this.discordBot) {
                resolve()
                return
            }

            const discordBot = new DiscordClient()

            discordBot.on("ready", () => {
                winston.info("Discord bot is ready!")
                this.discordBot = discordBot
                this.server = this.discordBot.guilds.find("id", this.config.server_id)
                resolve("Ready!")
            })
            discordBot.on("warn", (msg) => {
                winston.warn(`Discord bot warning: ${msg}`)
            })

            discordBot.login(this.config.bot_key)
            winston.info("Logging in as Discord bot...", {key: this.config.bot_key})

            setTimeout(() => {
                reject(new Error("Connecting timed out after 8 seconds"))
            }, 8000)

        })
    },

    sendTestMessage(config, discordBot, server) {
        return new Promise((resolve, reject) => {

            if (!discordBot) {
                reject("discordBot is not set in Discord.js!")
                return
            }

            winston.info(`Discord bot is on these servers: ${discordBot.guilds.keyArray()}`)
            if (!server) {
                reject(`Giolette is not a member of Discord server with ID ${discordBot.guilds.serverId}`)
                return
            }

            const testChannel = server.channels.find("name", config.test_channel)
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

    deleteTestMessage(config, server, message) {
        return new Promise((resolve, reject) => {
            if (message.id) {
                message.delete()
                this.setStatus(config.game)
                resolve(`Discord server: ${server.name}<br>Test channel: #${message.channel.name}<br>Test message ID: ${message.id}`)
            }
            reject(new Error("Could not identify sent test message"))
        })
    },

    test() {
        this.discordBot = null
        return this.init()
            .then(() => this.sendTestMessage(this.config, this.discordBot, this.server))
            .then((message) => this.deleteTestMessage(this.config, this.server, message))
    },

    log(spin) {
        const config = this.config
        const server = this.server
        return this.init().then(() => server.channels.find("name", spin.prize.log_channel).send({
            embed: {
                color: 7457935,
                description: `${spin.name} won **${spin.prize.name}**!`,
                timestamp: new Date(),
                author: {
                    name: spin.name,
                    icon_url: spin.avatar
                },
                footer: {
                    icon_url: `https://raw.githubusercontent.com/Jaid/giolette/master/src/res/images/prizes/${spin.prize.icon}.png`,
                    text: "Giolette"
                }
            }
        }))
    },

    setStatus(status) {
        if (!this.discordBot) {
            winston.warn(`Called setStatus(), but discordBot is ${this.discordBot}`)
        }

        this.discordBot.user.setGame(status)
    },

    clearStatus() {
        this.setStatus(null)
    }
}
