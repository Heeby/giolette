import gulp from "gulp"
import gulpUtil from "gulp-util"
import gulpNewer from "gulp-newer"
import gulpClean from "gulp-clean"

import webpack from "webpack"
import favicons from "gulp-favicons"
import webpackDevServer from "webpack-dev-server"

import appDescription from "./config/app_description"
import faviconsConfig from "./config/favicons"

const isDebug = global.DEBUG === false ? false : !process.argv.includes("--prod")

gulp.task("clean", function () {
    return gulp.src(["gen/", "dist/"], {read: false})
        .pipe(gulpClean())
})

gulp.task("copy-public", () => {
    return gulp.src(["public/*", "src/res/**"])
        .pipe(gulpNewer("dist"))
        .pipe(gulp.dest("dist"))
})

gulp.task("favicons", () => {
    return gulp.src("public/icon_1080.png")
        .pipe(gulpNewer({dest: "dist/favicon.ico", extra: "config/favicons.js"}))
        .pipe(favicons(faviconsConfig))
        .on("error", gulpUtil.log)
        .pipe(gulp.dest("dist"))
})

gulp.task("build", ["copy-public", "favicons", "build-browser-source"], (callback) => {

    const webpackConfig = require("./config/webpack.config")

    webpack(webpackConfig, function (err, stats) {

        if (err) {
            throw new gulpUtil.PluginError("webpack", err)
        }

        callback()

    })

})

gulp.task("build-browser-source",(callback) => {
    const webpackConfig = require("./browser_source/webpack.config")
    webpack(webpackConfig, function (err, stats) {
        if (err) {
            throw new gulpUtil.PluginError("webpack", err)
        }
        callback()
    })
})

gulp.task("run", ["copy-public", "favicons"], () => {

    let count = 0
    const browserSync = require("browser-sync")
    const reload = browserSync.reload
    const port = process.env.PORT || 3000
    const webpackConfig = require("./config/webpack.config")
    const compiler = webpack(webpackConfig)

    const webpackDevMiddleware = require("webpack-dev-middleware")(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: webpackConfig.stats
    })

    compiler.plugin("done", (stats) => {
        count += 1
        if (count === 1) {
            browserSync({
                server: {
                    port: port,
                    ui: port + 1,
                    baseDir: "dist",
                    middleware: [
                        webpackDevMiddleware,
                        require("webpack-hot-middleware")(compiler),
                        require("connect-history-api-fallback")()
                    ]
                }
            })
        }
    })

})
