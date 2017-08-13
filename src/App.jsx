import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import Layout from "jaid-web/components/Layout"
import css from "./style.css"

import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom"
import Index from "./index"

import icon from "../dist/favicon.ico"

export default class App extends React.Component {

    static propTypes = {
        className: PropTypes.string
    }

    updatePage = () => {
        console.log(`Set route to ${window.location.pathname}`)
        return null
    }

    NotFound = () => (
        <div>
            <h2>Whoops!</h2>
            <p>Nothing found at {location.pathname}</p>
        </div>
    )

    render() {
        return (
            <div className={classnames(this.props.className)}>
                <Router>
                    <Layout className={css.content} icon={icon} creditsBaseText="Jaid made this one for Giorap90 with">
                        {window.location.pathname.includes('index.html') && <Redirect to="/" />}
                        <Route path="/" component={this.updatePage} />
                        <Switch>
                            <Route exact path="/" component={Index} />
                            <Route component={this.NotFound} />
                        </Switch>
                    </Layout>
                </Router>
            </div>
        )
    }

}
