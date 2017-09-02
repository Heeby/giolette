module.exports = ({file, options, env}) => {
    const plugins = {
        "postcss-nested": null,
        "postcss-map": {basePath: "config", maps: ["theme.yml"]},
        "postcss-easings": null,
        "postcss-sprites": false, // Packs images into spritesheets
        "postcss-import": null, // Inlines @import statements
        "postcss-cssnext": null, // Adds a bunch of CSS features
        "postcss-flexbugs-fixes": null // Automatically fixes common flex problems
    }

    if (options.debug) {
        Object.assign(plugins, {
            "postcss-browser-reporter": null
        })
    }

    if (!options.debug) {
        Object.assign(plugins, {
            "postcss-sorting": {"properties-order": "alphabetical"},
            "cssnano": {autoprefixer: false}
        })
    }

    return {
        plugins: plugins
    }
}
