import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import css from "./style.css"

const colorFilters = {
    pending: null,
    running: "brightness(80%) sepia(50) saturate(5) hue-rotate(350deg)",
    success: "brightness(50%) sepia(1) saturate(20) hue-rotate(80deg)",
    error: "brightness(50%) sepia(1) saturate(80) hue-rotate(355deg)"
}

export default class Component extends React.Component {

    constructor(props) {
        super(props)
        this.state = {status: "pending"}
    }

    static propTypes = {
        className: PropTypes.string,
        name: PropTypes.string.isRequired,
        apiId: PropTypes.string.isRequired,
        status: PropTypes.string
    }

    render() {
        return (
            <div className={classnames(css.container, `api-${this.props.apiId}`, `api-status-${this.state.status}`, this.props.className)}>
                <img className={css.icon} src={require(`../../src/res/images/apis/${this.props.apiId}.png`)} style={{
                    filter: colorFilters[this.props.status]
                }}
                />
                <div className={css.name}>{this.props.name}</div>
            </div>
        )
    }

}
