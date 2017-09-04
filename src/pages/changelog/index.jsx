import React from "react"
import changelog from "../../../changelog_de.md"
import css from "./style.css"

export default class ChangelogPage extends React.Component {

    componentDidMount() {
    }

    render() {
        return <div dangerouslySetInnerHTML={{__html: changelog}} />
    }

}
