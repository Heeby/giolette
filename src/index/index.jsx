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
            customSpinUser: "J4idn"
        }
        this.state.apis.browserSource.htmlContent = browserSourceHtml
    }

    testApis = (apis) => {
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

        Promise.all([this.state.apis.twitchPublic.getAvatar(user)]).then((data) => {
            const spin = {
                name: data[0].displayName,
                avatar: data[0].avatar,
                points: 0,
                prize: selectedPrize,
                fake_prizes: fakePrizes
            }
            this.state.apis.websocket.send(spin)
            this.state.apis.discord.log(spin)
        })
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
                <br />
                <div style={{height: "100px"}}/>
                Prizes
                <Hr />
                {prizes.map(prize =>
                    <div className={css.prize}>
                        <img className={css.prizeIcon} src={require(`../res/images/prizes/${prize.icon}.png`)} style={{
                            filter: `brightness(${prize.brightness || 90}%) sepia(100%) saturate(${prize.saturation || 600}%) hue-rotate(${prize.hue || 170}deg)`
                        }}/>
<span>{prize.name}</span>
                        <span>{prize.weight} weight ({lodash.round(prize.weightNormalized * 100, 2)}%)</span>
                    </div>)}

            </div>
        )
    }

}
