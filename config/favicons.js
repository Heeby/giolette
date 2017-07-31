import appDescription from "./app_description"

export default {
    appName: appDescription.title,
    appDescription: appDescription.description,
    developerName: appDescription.authorName,
    developerURL: appDescription.authorUrl,
    version: appDescription.version,
    background: "#090818",
    theme_color: "#ff392a",
    display: "standalone",
    orientation: "portrait",
    start_url: "/?homescreen=1",
    logging: false,
    online: false,
    html: "../gen/favicons.html",
    pipeHTML: true,
    replace: true,
    icons: {
        android: {offset: 10},
        appleIcon: {offset: 10},
        appleStartup: {offset: 10},
        coast: {offset: 10},
        favicons: true,
        firefox: true,
        windows: true,
        yandex: true
    }
}