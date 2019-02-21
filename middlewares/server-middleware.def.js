'use strict';

const { rootDir } = require('../modules/helpers')

const packageNames = {
    helmet: 'helmet',
    json: 'body-parser',
    url: 'body-parser',
    multipart: 'multer',
    cookies: 'cookie-parser',
    session: 'express-session'
}

const validServerMiddlewareIds = Object.keys(packageNames)

function getServerMiddleware(mDef) {
    const isMDefStr = typeof mDef === 'string'

    const mId = isMDefStr ? mDef : mDef.name
    const mPackageName = rootDir+ '/node_modules/' + packageNames[mId]
    const mOptions = isMDefStr ? {} : mDef.options
    const m = require(mPackageName)

    return { middleware: middlewares[mId](m, mOptions) }
}

module.exports = { packageNames, validServerMiddlewareIds, getServerMiddleware }

//-------------------------------------------------------------------------------
// supporting middleware build definitions
//-------------------------------------------------------------------------------

const middlewares = {
    helmet: (m, options) => m(options),
    json:  (m, options) => m.json(options),
    url: (m, options) => m.urlencoded(options),
    multipart: (m, options) => m(options).array(),
    cookies: (m, options) => m(options),
    session: (m, options) => m(options)
}
