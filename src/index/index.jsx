import React from "react"
import electron, {BrowserWindow} from "electron"
import weightedChoice from "random-weighted-choice"
import lodash from "lodash"

import {Link} from "react-router-dom"
import ReactTooltip from "react-tooltip"
import ApiStatus from "../../components/ApiStatus"
import Button from "jaid-web/components/Button"
import Hr from "jaid-web/components/Hr"
import css from "./style.css"

import browserSourceHtml from "raw-loader!./../../gen/browser-source/index.html"

export default class Index extends React.Component {

    componentDidMount() {
    }

    constructor(props) {
        super(props)
        this.state = {
            apis: electron.remote.getGlobal("apis"),
            customSpinUser: "J4idn",
            tipeeeEventsReceived: null,
            tipeeeEventsAccepted: null,
            apisWorking: false
        }
        this.state.apis.browserSource.htmlContent = browserSourceHtml
    }

    testApis = (apis) => {
        this.setState({apisWorking: true})
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
                    api.status = "error"
                    api.tooltip = reason.message
                    this.setState({apisWorking: false})
                    this.forceUpdate(null)
                })
        })


    }

    loginWithTwitch = () => {
        electron.remote.getGlobal("initTwitchAuth")()
    }

    customSpin = () => {
        this.spin(this.state.customSpinUser)
    }

    spin = (user) => {
        const prizes = electron.remote.getGlobal("prizes")
        const weights = prizes.map((prize) => ({id: prize.name, weight: prize.weight}))
        const selectedPrize = lodash.find(prizes, {name: weightedChoice(weights)})
        const fakePrizes = []
        lodash.range(5).forEach(() => fakePrizes.push(lodash.sample(prizes)))

        if (selectedPrize.points) {
            this.state.apis.deepbot.addPoints(user, selectedPrize.points)
        }

        Promise.all([this.state.apis.twitchPublic.getAvatar(user), this.state.apis.deepbot.getPoints(user)]).then((data) => {
            const spin = {
                name: data[0].displayName,
                avatar: data[0].avatar,
                points: data[1],
                prize: selectedPrize,
                fake_prizes: fakePrizes
            }
            this.state.apis.websocket.send(spin)
            this.state.apis.discord.log(spin)
        })
    }

    startTipeee = () => {
        console.log("Starting")
        this.state.apis.tipeee.addListener(data => {

            if (!data.event.parameters.username) {
             console.log(`Skipping user with broken name ${data.event.parameters.username}`)
                return
            }

            if (data.event.type !== "subscription" && data.event.type !== "donation") {
                console.log(`I don't need the event type ${data.event.type}! Skipping.`)
                return
            }

            this.setState({tipeeeEventsReceived: this.state.tipeeeEventsReceived + 1})

            let spins
            if (data.event.type === "donation") {

                if (data.event.parameters.currency !== "EUR") {
                    console.log(`Ignoring currency ${data.event.parameters.currency}`)
                    return
                }

                console.log(`${data.event.parameters.username}: ${data.event.parameters.amount} ${data.event.parameters.currency}`)
                spins = lodash.floor(data.event.parameters.amount / 5)

            } else {

                console.log(`${data.event.parameters.username}: Subscription plan ${data.event.parameters.plan} (${+data.event.parameters.resub + 1} months)`)

                if (data.event.parameters.plan === "3000") {
                    spins = 8
                } else if (data.event.parameters.plan === "2000") {
                    spins = 3
                } else {
                    spins = 1
                }

            }

            if (spins < 1) {
                console.log(`${data.event.parameters.username}: spins is ${spins}, skipping`)
                return
            }

            console.log(`${data.event.parameters.username} gets ${spins} spins from Tipeee ${data.event.type} event`)

            for (let i = 0; i < spins; i++) {
                setTimeout(() => this.spin(data.event.parameters.username), (i + 3) * 1000)
            }

            this.setState({tipeeeEventsAccepted: this.state.tipeeeEventsAccepted + 1})

        })
        this.setState({tipeeeEventsReceived: 0})
        this.setState({tipeeeEventsAccepted: 0})
    }

    render() {

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

        const errorMessage = electron.remote.getGlobal("errorMessage")
        const prizes = electron.remote.getGlobal("prizes")

        return (

            <div>
                {errorMessage && <div className={css.errorMessage}>{errorMessage}</div>}
                <div className={css.customSpin}>
                    <input defaultValue="J4idn" onChange={(event) => this.setState({customSpinUser: event.target.value.trim()})}
                           className={css.customSpinInput} />
                    <Button className={css.customSpinButton} icon="play-circle" onClick={this.customSpin}
                            text={this.state.customSpinUser ? `Spin for ${this.state.customSpinUser}!` : "Spin"} />
                </div>
                Setting up your APIs
                <Hr />
                <div className={css.apiStatusContainer}>
                    {apis}
                </div>
                <br />
                <Button onClick={() => this.testApis()} containerClassName={css.button} text="Test APIs" />
                {this.state.apisWorking && <Button onClick={this.startTipeee} containerClassName={css.button} text="Start Tipeee" />}
                {Number.isInteger(this.state.tipeeeEventsReceived) &&
                <span className={css.tipeeeEvents}>Connected to
                    Tipeee ({this.state.tipeeeEventsAccepted} of {this.state.tipeeeEventsReceived} events accepted)</span>}
                <br />
                <div style={{height: "100px"}} />
                Prizes
                <Hr />
                {prizes.map(prize =>
                    <div className={css.prize}>
                        <img className={css.prizeIcon} src={require(`../res/images/prizes/${prize.icon}.png`)} style={{
                            filter: `brightness(${prize.brightness || 90}%) sepia(100%) saturate(${prize.saturation || 600}%) hue-rotate(${prize.hue || 170}deg)`
                        }} />
                        <span>{prize.name}</span>
                        <span>{prize.weight} weight ({lodash.round(prize.weightNormalized * 100, 2)}%)</span>
                    </div>)}

            </div>
        )
    }

}
