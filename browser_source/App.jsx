import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import Websocket from "react-websocket"
import Button from "jaid-web/components/Button"
import css from "./style.css"
import lodash from "lodash"
import {Animate, Transition} from "react-move"
import Appear from "react-move/lib/Appear"
import ReactInterval from "react-interval"

const d3 = require("d3-ease")

import defaultMessage from "!raw-loader!./default_message.json"
import gioletteIcon from "../public/icon_1080.png"

export default class App extends React.Component {

    componentDidMount() {
        if (window.location.hash.substr(1) === "debug") {
            document.getElementById("debug-panel").style.display = "block"
            document.body.style.background = "#1c1c1c"
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            currentRun: null,
            currentRunId: 0,
            queue: []
        }
    }

    checkQueue = () => {
        if (this.state.currentRun) {
            return
        }
        if (lodash.isEmpty(this.state.queue)) {
            return
        }
        const run = this.state.queue.shift()
        this.setState({
            currentRun: run,
            currentRunId: this.state.currentRunId + 1
        })
    }

    onPushMessage = () => {
        const textarea = document.getElementById("message-input")
        this.onMessage(textarea.value)
    }

    onMessage = (message) => {
        if (typeof message === "string") {
            message = JSON.parse(message.trim())
        }

        console.log(message);

        const truePrizeIndex = lodash.random(40, 80)

        const run = {
            name: message.name || "[?]",
            avatar: message.avatar || "http://i.imgur.com/odpSwkX.gif",
            icon: gioletteIcon,
            prizes: [],
            needleFinish: lodash.random(truePrizeIndex - 0.4, truePrizeIndex + 0.4, true),
            truePrizeIndex: truePrizeIndex,
            spinDuration: lodash.random(6000, 14000)
        }

        for (let i = 0; i < truePrizeIndex + 10; i++) {
            const prize = i === truePrizeIndex ? message.prize : lodash.sample(message.fake_prizes.concat(message.prize))
            run.prizes.push(prize)
        }

        this.setState({
            queue: this.state.queue.concat(run)
        })
    }

    render() {
        return <div>
            {!lodash.isEmpty(this.state.queue) &&
            <div className={css.queue} style={{backgroundImage: `url(${gioletteIcon})`}}>{lodash.map(this.state.queue, "name").join(", ")}</div>}
            <div id="debug-panel" className={css.debugPanel}>
                <textarea defaultValue={defaultMessage} id="message-input" rows="8" cols="50" />
                <br />
                <Button onClick={this.onPushMessage} text="Push Message" />
            </div>
            <ReactInterval enabled={true} timeout={1000} callback={this.checkQueue} />
            <Websocket url='ws://localhost:24491' onMessage={this.onMessage} />
            {this.state.currentRun &&
            <Wheel onFinish={() => this.setState({currentRun: null})} key={this.state.currentRunId} run={this.state.currentRun} />}
        </div>
    }

}

class Wheel extends React.Component {

    static propTypes = {
        className: PropTypes.string,
        run: PropTypes.object.isRequired,
        onFinish: PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = {
            phase: "intro",
            fadingOut: false
        }
    }

    onIntroFinish = () => {
        if (this.state.phase === "intro") {
            this.setState({
                phase: "showArrow"
            })
        }
    }

    onShowArrowFinish = () => {
        if (this.state.phase === "showArrow") {
            this.setState({
                phase: "spinning"
            })
        }
    }

    onSpinFinish = () => {
        if (this.state.phase === "spinning") {
            this.setState({
                phase: "hideFakePrizes"
            })
            setTimeout(() => {
                this.setState({
                    fadingOut: true
                })
            }, 3000)
            setTimeout(this.onFinish, 5000)
        }
    }

    onFinish = () => {
        this.props.onFinish()
    }

    render() {
        return <div style={{opacity: this.state.fadingOut ? 0 : 1}} className={css.wheel}>

            <Animate onRest={this.onIntroFinish} default={{opacity: 0, height: 0}} data={{opacity: 1, height: 210}}
                     duration={500}>
                {data => <div className={css.wheelHeader}
                              style={{opacity: data.opacity, height: data.height, overflow: this.state.phase === "intro" ? "hidden" : "initial"}}>
                    <Animate onRest={this.onShowArrowFinish} default={{size: 0}} data={{size: this.state.phase === "intro" ? 0 : 130}} duration={500}>
                        {data => <div style={{fontSize: `${data.size}px`, top: `${-data.size}px`}} className={css.wheelArrow}>▲</div>}
                    </Animate>
                    <img className={css.wheelIcon} src={this.props.run.avatar} />
                    <div className={css.wheelName}>{this.props.run.name}</div>
                </div>
                }
            </Animate>

            {(this.state.phase !== "intro" && this.state.phase !== "showArrow") &&
            <Animate onRest={this.onSpinFinish} default={{needlePosition: -10}}
                     data={{needlePosition: this.props.run.needleFinish}}
                     duration={this.props.run.spinDuration}>
                {data => <div>
                    {(this.props.run.prizes.map((prize, index) => {
                        return <WheelEntry isFake={index !== this.props.run.truePrizeIndex} isRevealed={this.state.phase === "hideFakePrizes"}
                                           needlePosition={data.needlePosition} index={index}
                                           prize={prize} />
                    }))}
                </div>
                }
            </Animate>}

        </div>
    }
}

class WheelEntry extends React.Component {

    static propTypes = {
        className: PropTypes.string,
        prize: PropTypes.object.isRequired,
        needlePosition: PropTypes.number.isRequired,
        index: PropTypes.number.isRequired,
        isFake: PropTypes.bool,
        isRevealed: PropTypes.bool
    }

    render() {
        const needleRelation = this.props.index - this.props.needlePosition
        const needleDistance = Math.abs(needleRelation)
        const needleDistanceEase = d3.easeCubicIn(needleDistance)
        const needleDistanceEaseOut = d3.easeExp(needleDistance)
        return <div style={{
            left: `${(needleRelation + 2) * 260}px`,
            top: `${(needleDistanceEase) * 10 + 10}px`,
            boxShadow: (!this.props.isFake && this.props.isRevealed) ? "0 0 5px black, inset 0 0 10px white" : "0 0 5px black",
            opacity: (this.props.isFake && this.props.isRevealed) ? 0.3 : 1
        }} className={css.prize}>
            <img className={css.prizeIcon} src={require(`../src/res/images/prizes/${this.props.prize.icon || "generic"}.png`)} style={{
                filter: `brightness(${this.props.prize.brightness || 90}%) sepia(100%) saturate(${this.props.prize.saturation || 600}%) hue-rotate(${this.props.prize.hue || 170}deg)`,
                width: `${150 - needleDistanceEaseOut * 40}px`,
                height: `${150 - needleDistanceEaseOut * 40}px`
            }} />
            <div className={css.prizeName}>{this.props.prize.name}</div>
        </div>
    }

}
