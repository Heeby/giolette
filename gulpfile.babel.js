import gulp from "gulp"
import gulpUtil from "gulp-util"
import gulpNewer from "gulp-newer"
import gulpClean from "gulp-clean"
import gulpBabel from "gulp-babel"
import gulpWebpack from "webpack-stream"

import webpack from "webpack"
import favicons from "gulp-favicons"
import webpackDevServer from "webpack-dev-server"

import appDescription from "./config/app_description"
import faviconsConfig from "./config/favicons"

const isDebug = global.DEBUG === true ? true : process.env.NODE_ENV !== "production"

gulp.task("clean", function () {
    return gulp.src(["gen/", "dist/", "release/"], {read: false})
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

gulp.task("babel", () => {
    return gulp.src(["./*.jsx", "./src/apis/*.jsx"], {base: "./"})
        .pipe(gulpBabel())
        .pipe(gulp.dest("."))
})

gulp.task("build", ["babel", "copy-public", "favicons", "build-browser-source"], () => {
    return gulp.src("./src/main.jsx")
        .pipe(gulpWebpack(require("./config/webpack.config")))
        .pipe(gulp.dest("./dist"))
})

gulp.task("build-browser-source", () => {
    return gulp.src("./browser_source/main.jsx")
        .pipe(gulpWebpack(require("./browser_source/webpack.config")))
        .pipe(gulp.dest("./gen/browser-source"))
})
