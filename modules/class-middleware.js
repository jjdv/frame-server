const { filePathNotEmpty, routePathsErr, checkName } = require('./helpers-basic')
const { createGetOnlyProps, createReadOnlyProps } = require('./helpers-object')
const Status = require('./class-status')
const { isEmpty } = require('./helpers-basic')

function Middleware(middlewareName, middlewareFn, routePaths, type = 'use') {
    if (middlewareArgsErr(middlewareName, middlewareFn, routePaths, type)) return

    createReadOnlyProps(this, {middlewareFn})
    createGetOnlyProps(this, {name: middlewareName, routePaths, type})
}

Middleware.typeErrCheck = function(type, middlewareName, status) {
    const allowedTypes = ['use', 'get', 'post', 'put', 'patch', 'delete', 'delete', 'connect', 'head', 'options', 'trace', 'all']
    if (!allowedTypes.includes(type)) {
        const extraInfo = middlewareName && typeof middlewareName === 'string' ? `provided for the middleware: ${middlewareName}.` : ''
        status.reportErr('Invalid middleware type: ', type, extraInfo)
    }
}

Middleware.validateDef = function(middlewareDef, options = {}, statusPar) {
    const status = statusPar ? statusPar : new Status
    if (isEmpty(middlewareDef)) {
        status.reportErr('A siteMiddleware definition cannot be empty.')
        return
    }

    const {rootDir, defaultType} = options
    if (typeof middlewareDef !== 'object') middlewareDef = { middleware: middlewareDef }
    const { name: middlewareName, middleware: middlewareFnDef, routePaths } = middlewareDef
    const middlewareFn = middlewareFnFromDef(middlewareFnDef, middlewareName, rootDir)
    const type = middlewareDef.type ? middlewareDef.type : (defaultType ? defaultType : 'use')

    if (middlewareArgsErr(middlewareName, middlewareFn, routePaths, type, status)) return null
    return [ middlewareName, middlewareFn, routePaths, type ]
}

Middleware.fromDef = function(middlewareDef, options = {}) {
    const mArgs = Middleware.validateDef(middlewareDef, options)
    if (!mArgs) return null
    return new Middleware(...mArgs)
}

Middleware.propotype.apply = function(app, report = true) {
    if (!app || !this.middlewareFn) return

    if (this.routePaths) app[this.type](this.routePaths, this.middlewareFn)
    else app[this.type](this.middlewareFn)
    if (report) console.log(`The middleware '${this.name}' has been applied.`)
}

module.exports = Middleware


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function middlewareArgsErr(middlewareName, middlewareFn, routePaths, type, statusPar) {
    const status = statusPar ? statusPar : new Status

    middlewareNameErrCheck(middlewareName, middlewareFn, status)
    middlewareFnErrCheck(middlewareFn, middlewareName, status)
    routePathsErr(routePaths, middlewareName, status)
    Middleware.typeErrCheck(type, middlewareName, status)

    return status.error
}

function middlewareNameErrCheck(middlewareName, middlewareFn, status) {
    return checkName(middlewareName, 'middleware', middlewareFn, status.name)
}

function middlewareFnErrCheck(middlewareFn, middlewareName, status) {
    if (!middlewareFn) status.reportErr('No middleware function provided.')
    else if (middlewareFn.contructor !== Function) {
        const extraInfo = middlewareName && typeof middlewareName === 'string' ? `provided for the middleware: ${middlewareName}.` : ''
        status.reportErr('Invalid format of middleware function: ', middlewareFn, extraInfo)
    }
}

function middlewareFnFromDef(middlewareDef, middlewareName, rootDir) {
    if (!rootDir) rootDir = process.env.serverRootDir
    switch (middlewareDef.constructor) {
        case String:
            const mPath = filePathNotEmpty(middlewareDef, rootDir, middlewareName, new Status)
            return mPath ? require(mPath) : null
        case Function: return middlewareDef
        default:
            const extraInfo = middlewareName && typeof middlewareName === 'string' ? `in the middleware: ${middlewareName}` : null
            console.error('Error: Invalid format of the middleware: ', middlewareDef, extraInfo)
            return null
    }
}