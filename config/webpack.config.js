import fs from "fs"
import path from "path"
import webpack from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import HtmlWebpackInlineSourcePlugin from "html-webpack-inline-source-plugin"

import appDescription from "./app_description"

const isDebug = global.DEBUG === true ? true : process.env.NODE_ENV !== "production"
const isVerbose = process.argv.includes("--verbose") || process.argv.includes("-v")
const isAnalyzing = process.argv.includes("--analyze")

const cssLoaderConfig = {
    sourceMap: isDebug,
    importLoaders: 1,
    modules: true, // CSS Modules https://github.com/css-modules/css-modules
    localIdentName: isDebug ? "[name]_[local]_[hash:base64:3]" : "[hash:base64:4]",
    minimize: !isDebug
}

const htmlMinifyConfig = {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    decodeEntities: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    removeRedundantAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    useShortDoctype: true
}

const config = {

    context: path.resolve(__dirname, "../src"),

    resolve: {
        extensions: [".js", ".jsx"]
    },

    target: "electron-renderer",

    // Developer tool to enhance debugging, source maps
    // http://webpack.github.io/docs/configuration.html#devtool
    devtool: isDebug ? "inline-source-map" : false,

    // What information should be printed to the console
    stats: {
        colors: true,
        reasons: isDebug,
        hash: isVerbose,
        version: isVerbose,
        timings: true,
        chunks: isVerbose,
        chunkModules: isVerbose,
        cached: isVerbose,
        cachedAssets: isVerbose
    },

    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": isDebug ? "\"development\"" : "\"production\"",
            __DEV__: isDebug
        }),
        new webpack.LoaderOptionsPlugin({
            debug: true,
            minimize: !isDebug
        }),
        new HtmlWebpackPlugin({
            template: "!!ejs-compiled-loader!" + path.resolve(__dirname, "index.ejs"),
            appDescription: appDescription,
            faviconHeaders: fs.readFileSync("gen/favicons.html", "utf8"),
            debug: isDebug,
            showErrors: isVerbose,
            minify: isDebug ? null : htmlMinifyConfig,
            filename: "index.html",
            inlineSource: ".js$"
        }),
        new HtmlWebpackInlineSourcePlugin
    ],

    module: {
        rules: [
            {
                test: /\.jsx/, // Enforces uncompiled files to end with .jsx
                include: [
                    path.resolve(__dirname, "../src"),
                    path.resolve(__dirname, "../components")
                ],
                use: "babel-loader"
            },
            {
                test: /\.css/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: cssLoaderConfig
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: "inline",
                            config: {
                                path: path.resolve(__dirname, "postcss.config.js"),
                                ctx: {
                                    debug: isDebug
                                }
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff2|ico)$/,
                loader: "url-loader"
            },
            {
                test: /\.(yml|yaml)$/,
                use: ["json-loader", "yaml-loader"]
            },
            {
                test: /\.json/,
                use: "json-loader"
            },
            {
                test: /\.txt/,
                use: "raw-loader"
            },
            {
                test: /\.(wav|mp3|ttf)$/,
                use: "file-loader"
            }
        ]
    }
}

// Optimizations in prod build
if (!isDebug) {
    config.plugins = config.plugins.concat([
        new webpack.optimize.AggressiveMergingPlugin,
        new webpack.optimize.OccurrenceOrderPlugin,
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: isVerbose
            }
        })
    ])
}

module.exports = config
