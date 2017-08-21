import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import Layout from "jaid-web/components/Layout"
import css from "./style.css"
import theme from "jaid-web/style/theme.css"

import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom"
import IndexPage from "./pages/index"
import PrizesPage from "./pages/prizes"
import ChatPrizesPage from "./pages/chat_prizes"
import ColorEditorPage from "./pages/color_editor"

import creditLibs from "../config/libs.yml"
import headerLinks from "../config/header_links.yml"
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
                    <Layout headerLinks={headerLinks} theme={theme} className={css.content} icon={icon} creditsBaseText="Jaid made this one for Giorap90 with" creditLibs={creditLibs}>
                        {window.location.pathname.includes('index.html') && <Redirect to="/" />}
                        <Route path="/" component={this.updatePage} />
                        <Switch>
                            <Route exact path="/" render={() => <IndexPage theme={theme} />} />
                            <Route exact path="/prizes" render={() => <PrizesPage theme={theme} />} />
                            <Route exact path="/chat-prizes" render={() => <ChatPrizesPage theme={theme} />} />
                            <Route exact path="/color-editor" render={() => <ColorEditorPage theme={theme} />} />
                            <Route component={this.NotFound} />
                        </Switch>
                    </Layout>
                </Router>
            </div>
        )
    }

}
