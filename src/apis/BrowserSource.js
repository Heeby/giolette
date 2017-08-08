import http from "http"
import request from "request"
import fs from "fs"

export default {
    name: "OBS BrowserSource",
    id: "browser_source",
    status: "pending",
    tooltip: null,

    httpServer: null,

    init() {
        return new Promise((resolve, reject) => {

            if (this.httpServer) {
                console.log("Skipping BrowserSource.init(): httpServer already initialized")
                resolve()
            }

            console.log(fs.readdirSync("."))
            this.httpServer = http.createServer(function (request, response) {
                response.writeHead(200, {"Content-Type": "text/html"})
                response.write(fs.readFile("test.txt", "utf8"))
                response.end()
            }).listen(24490, "localhost", null, resolve)

        })
    },

    testHttpServer() {
        return new Promise((resolve, reject) => {
            request("http://localhost:24490", (error, response, body) => {
                if (response.statusCode === 200) {
                    resolve(`Response status: ${response.statusMessage} ${response.statusCode}<br>Response body length: ${body.length}`)
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
        return this.init().then(this.testHttpServer)
    }
}
