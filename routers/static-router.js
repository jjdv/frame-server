'use strict';

const path = require('path')
const fs = require('fs')

module.exports = function getStaticRouter(serverConfig) {
    const { extRgx, staticFileExt, siteRoot } = serverConfig

    if (extRgx) {
        console.log(`Serving static files with extensions: ${staticFileExt.join(', ')}.`)
        return function(req, res) {
            if (!extRgx.test(req.path)) res.sendStatus(404)
            
            const  filePath = path.resolve(siteRoot, req.path.slice(1))
            if (fs.existsSync(filePath)) res.sendFile(filePath)
            else res.sendStatus(404)
        }
    } else {
        console.log('Serving static files with any extension.')
        return (req, res) => {
            const  filePath = path.resolve(siteRoot, req.path.slice(1))
            if (fs.existsSync(filePath)) res.sendFile(filePath)
            else res.sendStatus(404)
        }
    }
}
