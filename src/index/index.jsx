import React from "react"

import {Link} from "react-router-dom"

export default class Index extends React.Component {

    componentDidMount() {
    }

    render() {
        return (
            <Link to="/about">About (404)</Link>
        )
    }

}
