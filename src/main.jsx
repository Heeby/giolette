import React from "react"
import ReactDom from "react-dom"
import GoogleAnalytics from "react-ga"
import FastClick from "fastclick"
import * as OfflinePluginRuntime from "offline-plugin/runtime"
import App from "./App"

OfflinePluginRuntime.install()

if (window.appDescription.googleAnalyticsTrackingId) {
    GoogleAnalytics.initialize(window.appDescription.googleAnalyticsTrackingId)
}

ReactDom.render(
    <App />, document.getElementById("react")
)

// Removes 300 ms delay for better feel on mobile
// https://github.com/ftlabs/fastclick
FastClick.attach(document.body)

