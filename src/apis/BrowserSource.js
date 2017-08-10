import http from "http"
import request from "request"

export default {
    name: "OBS BrowserSource",
    id: "browser_source",
    status: "pending",
    tooltip: null,
    config: null,

    htmlContent: null,
    httpServer: null,

    init() {
        const port = this.config.port
        return new Promise((resolve, reject) => {

            if (this.httpServer) {
                console.log("Skipping BrowserSource.init(): httpServer already initialized")
                resolve()
                return
            }

            const htmlContent = this.htmlContent
            this.httpServer = http.createServer(function (request, response) {
                response.writeHead(200, {"Content-Type": "text/html"})
                response.write(htmlContent)
                response.end()
            }).listen(port, "localhost", null, resolve)

        })
    },

    testHttpServer(browserSource) {
        return new Promise((resolve, reject) => {
            request(`http://localhost:${browserSource.config.port}`, (error, response, body) => {
                if (response.statusCode === 200) {
                    resolve(`Response status: ${response.statusMessage} ${response.statusCode}<br>Response body length: ${body.length}<br>Port: ${browserSource.config.port}`)
                }

                reject(new Error(`BrowserSource Response is ${response.statusMessage} ${response.statusCode}`))
            })
        })
    },

    async test() {
        if (this.httpServer) {
            await this.httpServer.close()
        }
        this.httpServer = null
        return this.init().then(()=>this.testHttpServer(this))
    }
}
