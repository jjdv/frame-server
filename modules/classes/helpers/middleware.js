const {
  Status,
  statusFunctions: { routePathsErr, nameErr, safeRequire }
} = require('node-basic-helpers')

const middlewareMock = {
  name: undefined,
  middlewareFn: null,
  apply: () => {}
}

function middlewareDefToArgs (
  middlewareDef,
  options = {},
  status = new Status()
) {
  const { rootDir, defaultType } = options
  const {
    name: middlewareName,
    middleware: middlewareFnDef,
    routePaths
  } = middlewareDef

  const middlewareFn = middlewareFnFromDef(
    middlewareFnDef,
    middlewareName,
    rootDir
  )
  const type = middlewareDef.type ? middlewareDef.type : defaultType || 'use'

  nameErr(middlewareName, 'middleware', middlewareDef, status)
  middlewareFnErrCheck(middlewareFn, middlewareName, status)
  if (routePaths) routePathsErr(routePaths, middlewareName, status)
  middlewareTypeErrCheck(type, middlewareName, status)

  return [middlewareName, middlewareFn, routePaths, type]
}

function middlewareFnErrCheck (middlewareFn, middlewareName, status) {
  if (!middlewareFn) {
    const extraInfo = `provided for the middleware: '${middlewareName}'.`
    status.reportErr(`No middleware function ${extraInfo}`)
  }
}

function middlewareTypeErrCheck (type, middlewareName, status) {
  const allowedTypes = [
    'use',
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'delete',
    'connect',
    'head',
    'options',
    'trace',
    'all'
  ]
  if (!allowedTypes.includes(type)) {
    status.reportErr(
      'Invalid middleware type: ',
      type,
      `provided for the middleware: '${middlewareName}'.`
    )
  }
}

function middlewareFnFromDef (middlewareDef, middlewareName, rootDir) {
  if (!rootDir) rootDir = process.env.APP_ROOT_DIR
  switch (middlewareDef && middlewareDef.constructor) {
    case String:
      return safeRequire(middlewareDef, middlewareName, rootDir)
    case Function:
      return middlewareDef
    default:
      console.error(
        'Error: Invalid format of the middleware: ',
        middlewareDef,
        `in the middleware: '${middlewareName}'`
      )
      return null
  }
}

module.exports = {
  middlewareMock,
  middlewareDefToArgs,
  middlewareFnErrCheck,
  middlewareTypeErrCheck,
  middlewareFnFromDef
}
