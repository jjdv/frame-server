// Possible formats of serveFileDef:
// - falsy value: (false/null/undefined) to serve files on the path basis only
// - string: 'pathToFile' - just single file to be served for all paths. In this option parameter 'staticFileExt' is required
// - object: (file: 'pathToFile, routePaths: pathsToBeUsed) - dedicated file to be served for paths specified in the format accepted by Express
// Paths of dedicated files are specified relative to siteRootDir

'use strict';

const express = require('express')
const router = express.Router()

module.exports = function getFilesRouter(serverConfig) {
    const { serveFileDef, extRgx } = serverConfig
    if (!serveFileDef) return null

    const filePath = serveFileDef.file
    if (serveFileDef.routePaths) {
        const paths = serverConfig.serveFileDef.routePaths

        // serving the defined file for all defined paths
        router.get(paths, (req, res) => res.sendFile(filePath))
        console.log(`Serving the file ${filePath.match(/\/[^\/]$/)[0]} for all defined paths.`)
    } else {
        
        // serving the defined file for all paths except static files with defined extensions
        router.get('*', (req, res, next) => {
            if (extRgx.test(req.path)) next()
            else res.sendFile(filePath)
        })
        console.log(`Serving file ${filePath.match(/[^\/\\]+$/)[0]} for all paths except static files with extensions: ${serverConfig.staticFileExt.join(', ')}.`)
    }

    return router
}
