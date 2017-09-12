import React from "react"
import electron, {BrowserWindow} from "electron"
import weightedChoice from "random-weighted-choice"
import lodash from "lodash"
import PropTypes from "prop-types"

import {Link} from "react-router-dom"
import ReactTooltip from "react-tooltip"
import ApiStatus from "../../../components/ApiStatus"
import Button from "jaid-web/components/Button"
import Interval from "react-interval"
import css from "./style.css"

import browserSourceHtml from "raw-loader!./../../../gen/browser-source/index.html"

const winston = electron.remote.getGlobal("winston")

export default class IndexPage extends React.Component {

    static propTypes = {
        theme: PropTypes.object.isRequired,
        onApisTested: PropTypes.func
    }

    componentDidMount() {
    }

    constructor(props) {
        super(props)
        this.state = {
            apis: electron.remote.getGlobal("apis"),
            customSpinUser: "J4idn",
            tipeeeEventsReceived: null,
            tipeeeEventsAccepted: null,
            apisWorking: false,
            customSpins: null,
            customChatSpins: null,
            autoChatSpins: null
        }
        this.state.apis.browserSource.htmlContent = browserSourceHtml
    }

    testApis = (apis) => {
        winston.info("Testing APIs...")
        this.setState({apisWorking: true})
        this.props.onApisTested()
        apis = Array.isArray(apis) ? apis : Object.values(this.state.apis)

        apis.forEach((api) => {
            api.status = "running"
            api.tooltip = "Testing..."
            this.forceUpdate(null)
            api.test()
                .then((successValue) => {
                    api.status = "success"
                    api.tooltip = Array.isArray(successValue) ? successValue.join("<hr>") : successValue
                    this.forceUpdate(null)
                })
                .catch((reason) => {
                    winston.error(`Error on testing ${api.name}: ${reason.message}`)
                    api.status = "error"
                    api.tooltip = reason.message
                    this.setState({apisWorking: false})
                    this.forceUpdate(null)
                })
        })
    }

    customSpin = () => {
        this.spin(this.state.customSpinUser, "custom_spin")
        this.setState({
            customSpins: this.state.customSpins + 1
        })
    }

    customChatSpin = () => {
        this.chatSpin()
        this.setState({
            customChatSpins: this.state.customChatSpins + 1
        })
    }

    chatSpin = () => {
        this.state.apis.twitchPublic.getChatters().then(chatters => {
            const filteredChatters = this.state.apis.twitchPublic.config.excludes
                ? chatters.filter(chatter => !this.state.apis.twitchPublic.config.excludes.includes(chatter.toLowerCase()))
                : chatters
            const pickedUser = lodash.sample(filteredChatters)
            if (!pickedUser) {
                winston.info(`pickedUser is ${pickedUser}`)
                return
            }
            winston.info(`Chat spin: ${pickedUser}`)
            this.spin(pickedUser, "chat_spin", electron.remote.getGlobal("chatPrizes"))
        })
    }

    autoChatSpin = () => {
        this.setState({
            autoChatSpins: this.state.autoChatSpins + 1
        })
        this.chatSpin()
    }

    spin = (user, reason, prizes = electron.remote.getGlobal("prizes")) => {
        const weights = prizes.map((prize) => ({id: prize.name, weight: prize.weight}))
        const selectedPrize = lodash.find(prizes, {name: weightedChoice(weights)})
        const fakePrizes = []
        lodash.range(5).forEach(() => fakePrizes.push(lodash.sample(prizes)))

        if (selectedPrize.points) {
            this.state.apis.deepbot.addPoints(user, selectedPrize.points)
        }

        winston.info("Spin initiated", {user: user, reason: reason, prize: selectedPrize})

        Promise.all([this.state.apis.twitchPublic.getAvatar(user), this.state.apis.deepbot.getPoints(user)]).then((data) => {
            const spin = {
                name: data[0].displayName,
                avatar: data[0].avatar,
                points: data[1],
                prize: selectedPrize,
                fake_prizes: fakePrizes,
                reason: reason
            }
            this.state.apis.websocket.send(spin)
            this.state.apis.discord.log(spin)
        })
    }

    startTipeee = () => {
        this.state.apis.tipeee.addListener(data => {

            winston.debug("Received Tipeee event", data)

            if (!data.event.parameters.username) {
                winston.warn(`Skipping user with broken name ${data.event.parameters.username}`)
                return
            }

            if (data.event.type !== "subscription" && data.event.type !== "donation") {
                winston.info(`I don't need the event type ${data.event.type}! Skipping.`)
                return
            }

            this.setState({tipeeeEventsReceived: this.state.tipeeeEventsReceived + 1})

            let spins
            if (data.event.type === "donation") {

                if (data.event.parameters.currency !== "EUR") {
                    winston.info(`Ignoring currency ${data.event.parameters.currency}`)
                    return
                }

                winston.info(`${data.event.parameters.username}: ${data.event.parameters.amount} ${data.event.parameters.currency}`)
                spins = lodash.floor(data.event.parameters.amount / 5)

            } else {

                winston.info(`${data.event.parameters.username}: Subscription plan ${data.event.parameters.plan} (${+data.event.parameters.resub + 1} months)`)

                if (data.event.parameters.plan === "3000") {
                    spins = 8
                } else if (data.event.parameters.plan === "2000") {
                    spins = 3
                } else {
                    spins = 1
                }

            }

            if (spins < 1) {
                winston.info(`${data.event.parameters.username}: spins is ${spins}, skipping`)
                return
            }

            winston.info(`${data.event.parameters.username} gets ${spins} spins from Tipeee ${data.event.type} event`)

            for (let i = 0; i < spins; i++) {
                setTimeout(() => this.spin(data.event.parameters.username, "tipeee"), (i + 3) * 1000)
            }

            this.setState({tipeeeEventsAccepted: this.state.tipeeeEventsAccepted + 1})

        })
        this.setState({tipeeeEventsReceived: 0})
        this.setState({tipeeeEventsAccepted: 0})
        winston.info("Started listening to Tipeee events")
    }

    render() {

        const errorMessage = electron.remote.getGlobal("errorMessage")
        const apis = Object.keys(this.state.apis).map((i) => {
            const api = this.state.apis[i]
            return (
                <div key={api.id} data-tip data-for={`api-tooltip-${api.id}`}>
                    <ApiStatus status={api.status} name={api.name} apiId={api.id} />
                    {api.tooltip &&
                    <ReactTooltip type={api.status === "error" ? "error" : "dark"} id={`api-tooltip-${api.id}`} html={true} class={css.apiTooltip}>
                        {api.tooltip}
                    </ReactTooltip>}
                </div>
            )
        })

        return (
            <div>
                Custom Spin
                <hr />
                {errorMessage && <div className={css.errorMessage}>{errorMessage}</div>}
                <div className={css.customSpin}>
                    <input defaultValue="J4idn" onChange={(event) => this.setState({customSpinUser: event.target.value.trim()})}
                           className={css.customSpinInput} />
                    <Button enabled={this.state.apisWorking} theme={this.props.theme} className={css.customSpinButton} icon="play-circle"
                            onClick={this.customSpin}
                            text={this.state.customSpinUser ? `Spin for ${this.state.customSpinUser}!` : "Spin"} />
                    {this.state.customSpins && <span className={css.customSpinText}>Times used: {this.state.customSpins}</span>}
                    <br /><br />
                    <Button onClick={this.customChatSpin} enabled={this.state.apisWorking} theme={this.props.theme} icon="play-circle"
                            text={`Chat spin for someone viewing ${this.state.apis.twitchPublic.config.channel_name}`} className={css.chatSpinButton} />
                    {this.state.customChatSpins && <span className={css.customChatSpinText}>Times used: {this.state.customChatSpins}</span>}
                </div>
                Setting up {apis.length} APIs
                <hr />
                <div className={css.apiStatusContainer}>
                    {apis}
                </div>
                <br />
                <Button icon={this.state.apisWorking ? "check" : "cube"} theme={this.props.theme} enabled={!this.state.apisWorking}
                        onClick={() => this.testApis()} className={css.button} text="Test APIs" />
                <Button icon="bolt" theme={this.props.theme} enabled={this.state.apisWorking && !Number.isInteger(this.state.tipeeeEventsReceived)}
                        onClick={this.startTipeee} className={css.button}
                        text="Start Tipeee" />
                {Number.isInteger(this.state.tipeeeEventsReceived) &&
                <span className={css.tipeeeEvents}>Connected to
                    Tipeee ({this.state.tipeeeEventsAccepted} of {this.state.tipeeeEventsReceived} events accepted)</span>}

                <Interval timeout={this.state.apis.twitchPublic.config.chat_spin_interval_minutes * 1000 * 60} enabled={this.state.apisWorking}
                          callback={this.autoChatSpin} />
                <br />
                {this.state.autoChatSpins && <div className={css.autoChatSpinText}>Automatic spins for stream viewers: {this.state.autoChatSpins}</div>}
            </div>
        )
    }

}
