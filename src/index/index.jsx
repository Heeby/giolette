import React from "react"

import {Link} from "react-router-dom"
import ApiStatus from "../../components/ApiStatus"
import Button from "jaid-web/components/Button"
import Hr from "jaid-web/components/Hr"
import css from "./style.css"

export default class Index extends React.Component {

    componentDidMount() {
    }

    render() {
        return (
            <div>
                Setting up your APIs
                <Hr />
                <div className={css.apiStatusContainer}>
                    <ApiStatus name="Twitch Private" />
                    <ApiStatus name="Twitch Public" />
                    <ApiStatus name="Tipeee" />
                    <ApiStatus name="Deepbot" />
                    <ApiStatus name="Discord" />
                </div>
                <Button containerClassName={css.apiTestButton} text="Test APIs"/>
            </div>
        )
    }

}
