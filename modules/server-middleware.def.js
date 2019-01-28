'use strict';

const packageNames = exports.packageNames = {
    helmet: 'helmet',
    json: 'body-parser',
    url: 'body-parser',
    multipart: 'multer',
    cookies: 'cookie-parser',
    session: 'express-session'
}

exports.getServerMiddleware = (mDef) => {
    const isMDefStr = typeof mDef === 'string'

    const mId = isMDefStr ? mDef : mDef.name
    const mPackageName = packageNames[mId]
    const mOptions = isMDefStr ? {} : mDef.options
    const m = require(mPackageName)

    return middlewares[mId](m, mOptions)
}


//-------------------------------------------------------------------------------
// supporting middleware build definitions
//-------------------------------------------------------------------------------

const middlewares = {
    helmet: (m, options) => m(options),
    json:  (m, options) => m.json(options),
    url: (m, options) => m.urlencoded(options),
    multipart: (m, options) => m(options),
    cookies: (m, options) => m(options),
    session: (m, options) => m(options)
}
