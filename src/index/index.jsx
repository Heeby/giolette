import React from "react"
import electron, {BrowserWindow} from "electron"

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
            apis: electron.remote.getGlobal("apis")
        }
        this.state.apis.browserSource.htmlContent = browserSourceHtml;
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

        return (
            <div>
                Setting up your APIs
                <Hr />
                <div className={css.apiStatusContainer}>
                    {apis}
                </div>
                <Button onClick={this.loginWithTwitch} containerClassName={css.button} text="Login with Twitch" />
                <br />
                <Button onClick={() => this.testApis()} containerClassName={css.button} text="Test APIs" />
                <br />
            </div>
        )
    }

}
