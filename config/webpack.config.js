import fs from "fs"
import path from "path"
import webpack from "webpack"
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer"
import OfflinePlugin from "offline-plugin"
import HtmlWebpackPlugin from "html-webpack-plugin"

import appDescription from "./app_description"

const isDebug = global.DEBUG === false ? false : !process.argv.includes("--prod")
const isVerbose = process.argv.includes("--verbose") || process.argv.includes("-v")
const isAnalyzing = process.argv.includes("--analyze")
const useHMR = !!global.HMR // Hot Module Replacement (HMR)

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

    entry: [
        "./main"
    ],

    resolve: {
        extensions: [".js", ".jsx"]
    },

    target: "electron-renderer",

    output: {
        path: path.resolve(__dirname, "../dist/"),
        publicPath: './',
        filename: isDebug ? "[name].js?[hash]" : "[name].[hash].js",
        chunkFilename: isDebug ? "[id].js?[chunkhash]" : "[id].[chunkhash].js",
        sourcePrefix: "  "
    },

    // Developer tool to enhance debugging, source maps
    // http://webpack.github.io/docs/configuration.html#devtool
    devtool: isDebug ? "source-map" : false,

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
            debug: isDebug,
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
            inject: "body"
        })
    ],

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules\/(?!(jaid-web)\/).*/,
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
                    "postcss-loader"
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff2)$/,
                loader: "url-loader",
                options: {
                    limit: 8192
                }
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
                test: /\.(wav|mp3|ttf)$/,
                use: "file-loader"
            }
        ]
    }
}

// Optimizations in prod build
if (!isDebug) {
    config.plugins = config.plugins.concat([
        // new webpack.optimize.AggressiveMergingPlugin, // Conflict with ServiceWorker from OfflinePlugin
        new webpack.optimize.OccurrenceOrderPlugin,
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: isVerbose
            }
        })
    ])
}

if (isAnalyzing) {
    config.plugins = config.plugins.concat([
        new BundleAnalyzerPlugin
    ])
}

// Hot Module Replacement (HMR) + React Hot Reload
if (isDebug && useHMR) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin())
    config.plugins.push(new webpack.NoEmitOnErrorsPlugin())
}

module.exports = config
