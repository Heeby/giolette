import React from "react"

import {Link} from "react-router-dom"
import ApiStatus from "../../components/ApiStatus"

export default class Index extends React.Component {

    componentDidMount() {
    }

    render() {
        return (
            <div>
                Setting up your APIs
                <hr />
                <ApiStatus/>
            </div>
        )
    }

}
