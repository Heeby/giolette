import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import css from "./style.css"

export default class Component extends React.Component {

    static propTypes = {
        className: PropTypes.string,
        name: PropTypes.string.isRequired
    }

    render() {
        return (
            <div className={classnames(css.container, this.props.className)}>
                <div className={css.name}>{this.props.name}</div>
            </div>
        )
    }

}
