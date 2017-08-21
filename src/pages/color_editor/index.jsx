import React from "react"
import electron from "electron"
import lodash from "lodash"

import {Link} from "react-router-dom"
import ReactTooltip from "react-tooltip"
import css from "./style.css"

export default class ColorEditorPage extends React.Component {

    componentDidMount() {
    }

    constructor(props) {
        super(props)
        this.state = {
            prizes: electron.remote.getGlobal("prizes")
        }
    }

    render() {
        return (
            <div>
                Color Editor
                <hr />
            </div>
        )
    }

}
