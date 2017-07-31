import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import GoogleAnalytics from "react-ga"
import Layout from "jaid-web/components/Layout"
import css from "./style.css"

import {BrowserRouter as Router, Switch, Route} from "react-router-dom"
import Index from "./index"

export default class App extends React.Component {

    static propTypes = {
        className: PropTypes.string
    }

    updatePage = () => {
        console.log(`Set route to ${window.location.pathname}`)
        GoogleAnalytics.set({page: window.location.pathname})
        GoogleAnalytics.pageview(window.location.pathname)
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
                    <Layout className={css.content}>
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
