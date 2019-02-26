'use strict';

const packageNames = {
    helmet: 'helmet',
    json: 'express',
    url: 'express',
    multipart: 'multer',
    cookies: 'cookie-parser',
    session: 'express-session'
}

const validServerMiddlewareIds = Object.keys(packageNames)

function getServerMiddleware(mDef) {
    const isMDefStr = typeof mDef === 'string'
    const mId = isMDefStr ? mDef : mDef.name
    const mOptions = isMDefStr ? {} : mDef.options
    const m = require( packageNames[mId] )
    
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
