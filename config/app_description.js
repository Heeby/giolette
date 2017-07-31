const fs = require("fs")
const packageData = JSON.parse(fs.readFileSync("package.json", "utf8"))

const title = "Giolette"
const version = packageData.version
const embedTitle = title
const authorName = packageData.author.name
const authorUrl = "https://github.com/jaid"
const siteUrl = "http://github.com/jaid/giolette"
const description = packageData.description
const thumbnail = siteUrl + "/coast-228x228.png"
const thumbnailSize = 228
const language = "en"
const locale = "en_US"
const twitterHandle = "itsjaid"
const facebookAuthorProfile = "hms257"
const googleAnalyticsTrackingId = null
const googleAdsenseClient = null

module.exports = {
    id: packageData.name,
    title: title,
    version: version,
    language: language,
    locale: locale,
    siteUrl: siteUrl,
    authorName: authorName,
    authorUrl: authorUrl,
    description: description,
    appleMeta: { // https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
        statusBarStyle: "black",
        parsePhoneNumbers: false
    },
    openGraph: { // http://ogp.me/
        title: embedTitle,
        description: description,
        url: siteUrl,
        locale: locale,
        image: thumbnail,
        imageWidth: thumbnailSize,
        imageHeight: thumbnailSize
    },
    openGraphFacebook: { // https://developers.facebook.com/docs/sharing/opengraph/object-properties
        updatedTime: new Date().getTime(),
        authorProfileId: facebookAuthorProfile
    },
    twitterCard: { // https://dev.twitter.com/cards/markup
        title: embedTitle,
        description: description,
        authorProfileHandle: twitterHandle,
        businessProfileHandle: twitterHandle,
        image: thumbnail
    },
    fontAwesome: {
        version: "4.7.0"
    },
    googleFonts: [
        "Ubuntu:400,700&subset=latin-ext",
        "Roboto:400,700&subset=latin-ext"
    ],
    googleAnalytics: { // https://analytics.google.com/analytics/web
        trackingId: googleAnalyticsTrackingId
    },
    googleAdsense: {
        adClient: googleAdsenseClient
    }
}
