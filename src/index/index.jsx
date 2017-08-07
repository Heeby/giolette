import React from "react"
import electron from "electron"

import {Link} from "react-router-dom"
import ReactTooltip from "react-tooltip"
import ApiStatus from "../../components/ApiStatus"
import Button from "jaid-web/components/Button"
import Hr from "jaid-web/components/Hr"
import css from "./style.css"

export default class Index extends React.Component {

    componentDidMount() {
        this.testApis()
    }

    constructor(props) {
        super(props)
        this.state = {
            apis: electron.remote.getGlobal("apis")
        }
    }

    testApis = () => {
        const apis = Object.values(this.state.apis)

        apis.forEach((api) => {
            api.status = "running"
            this.forceUpdate(null)
            api.test().then(
                (successValue) => {
                    api.status = "success"
                    api.tooltip = successValue
                    this.forceUpdate(null)
                },
                (reason) => {
                    api.status = "error"
                    api.tooltip = reason.message
                    this.forceUpdate(null)
                }
            )
        })
    }

    render() {

        const apis = Object.keys(this.state.apis).map((i) => {
            const api = this.state.apis[i]
            return (
                <div key={api.id} data-tip data-for={`api-tooltip-${api.id}`}>
                    <ApiStatus status={api.status} name={api.name} apiId={api.id} />
                    {api.tooltip &&
                    <ReactTooltip data-type={api.status === "success" ? "dark" : "error"} id={`api-tooltip-${api.id}`} html={true} class={css.apiTooltip}>
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
                <Button onClick={this.testApis} containerClassName={css.apiTestButton} text="Test APIs" />
            </div>
        )
    }

}
