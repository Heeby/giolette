import React from "react"
import electron from "electron"

import {Link} from "react-router-dom"
import ApiStatus from "../../components/ApiStatus"
import Button from "jaid-web/components/Button"
import Hr from "jaid-web/components/Hr"
import css from "./style.css"

export default class Index extends React.Component {

    componentDidMount() {
    }

    constructor(props) {
        super(props)
        this.state = {
            apis: electron.remote.getGlobal("apis")
        }
    }

    render() {

        const apis = Object.keys(this.state.apis).map((i) =>
            <ApiStatus key={this.state.apis[i].id} name={this.state.apis[i].name} />
        )

        return (
            <div>
                Setting up your APIs
                <Hr />
                <div className={css.apiStatusContainer}>
                    {apis}
                </div>
                <Button containerClassName={css.apiTestButton} text="Test APIs" />
            </div>
        )
    }

}
