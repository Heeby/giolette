import path from "path"
import webpack from "webpack"
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer"
import HtmlWebpackPlugin from "html-webpack-plugin"
import HtmlWebpackInlineSourcePlugin from "html-webpack-inline-source-plugin"

const isDebug = global.DEBUG === false ? false : !process.argv.includes("--prod")
const isVerbose = process.argv.includes("--verbose") || process.argv.includes("-v")

const cssLoaderConfig = {
    sourceMap: isDebug,
    importLoaders: 1,
    modules: true, // CSS Modules https://github.com/css-modules/css-modules
    localIdentName: isDebug ? "[name]_[local]_[hash:base64:3]" : "[hash:base64:4]",
    minimize: !isDebug
}

const config = {

    context: path.resolve(__dirname, "."),

    entry: [
        "./main"
    ],

    resolve: {
        extensions: [".js", ".jsx"]
    },

    output: {
        path: path.resolve(__dirname, "../dist/browser-source"),
        publicPath: "./",
        filename: "[name].js",
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
        new webpack.LoaderOptionsPlugin({
            debug: isDebug,
            minimize: !isDebug
        }),
        new HtmlWebpackPlugin({
            inlineSource: ".(js|css)$"
        }),
        new HtmlWebpackInlineSourcePlugin
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
                loader: "url-loader"
            },
            {
                test: /\.json/,
                use: "json-loader"
            },
            {
                test: /\.(mp3|ttf)$/,
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
