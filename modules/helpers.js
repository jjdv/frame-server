'use strict';

exports.exit = function(...errMsg) {
    if (errMsg.length) {
        console.error(...errMsg)
        process.exit(9)
    }
}

exports.ErrorBox = function() {
    let error = false

    Object.defineProperty(this, 'status', {
        get: function() { return error },
        set: function() { console.error('Error: attempt to write to ErrorBox status property!') }
    })

    this.report = function(...errMsg) {
        if (errMsg.length) console.error(...errMsg)
        error = true
    }
}

const filePath = exports.filePath = function(pathDef, rootDir, varName, errorHandler) {
    if (typeof pathDef !== 'string') {
        errorHandler.report(`Error: Wrong file path format of ${varName}.`)
        return null
    }
    if (!pathDef) return null

    const filePath = path.resolve(rootDir, pathDef)
    if (!fs.existsSync(filePath)) {
        errorHandler.report(`Error: Cannot find the file "${filePath}" specified by the ${varName} as "${pathDef}"`)
        return null
    }
    return filePath
}

exports.filePathNotEmpty = function(pathDef, rootDir, varName, errorHandler) {
    if (pathDef) return filePath(pathDef, rootDir, varName, errorHandler)

    errorHandler.report(`Error: The specification of the file path in the ${varName} cannot be an empty string.`)
    return null
}

exports.routePathsErr = function(paths, varName, errorHandler) {
    if (Array.isArray(paths)) {
        for (let path of paths) if (routePathErr(path, varName, errorHandler)) return true
        return false
    } else return routePathErr(paths, varName, errorHandler)
}

exports.applyMiddleware = function(middlewareDef, app) {
    if (middlewareDef.routePaths) app.use(middlewareDef.routePaths, middlewareDef.middleware)
    else app.use(middlewareDef.middleware)
}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

const isRegExp = val => val.constructor === RegExp

function routePathErr(path, varName, errorHandler) {
    let error = false
    if (typeof path === 'string') {
        if (!path) {
            errorHandler.report(`Error: The specification of the path in ${varName} cannot be an empty string.`)
            error = true
        } else if (path[0] != '/') {
            errorHandler.report(`Error: Route paths in ${varName} should be absolute, i.e. start with: '/' but is defined as: ${path}`)
            error = true
        }
    } else if (!isRegExp(path)) {
        errorHandler.report(`Wrong path format in ${varName}.`)
        error = true
    }
    return error
}
