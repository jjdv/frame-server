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
  const {
    name: middlewareName,
    middleware: middlewareFnDef,
    routePaths
  } = middlewareDef
  const { rootDir, defaultType } = options
  const middlewareFn = middlewareFnFromDef(
    middlewareFnDef,
    middlewareName,
    rootDir
  )
  const type = middlewareDef.type ? middlewareDef.type : defaultType || 'use'

  nameErr(middlewareName, 'middleware', middlewareDef, status)
  if (routePaths) routePathsErr(routePaths, middlewareName, status)
  middlewareTypeErrCheck(type, middlewareName, status)

  return [middlewareName, middlewareFn, routePaths, type]
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

function middlewareFnFromDef (middlewareFnDef, middlewareName, rootDir) {
  if (!rootDir) rootDir = process.env.APP_ROOT_DIR
  switch (middlewareFnDef && middlewareFnDef.constructor) {
    case String:
      return safeRequire(middlewareFnDef, middlewareName, rootDir)
    case Function:
      return middlewareFnDef
    default:
      console.error(
        'Error: Invalid format of the middleware: ',
        middlewareFnDef,
        `in the middleware: '${middlewareName}'`
      )
      return null
  }
}

module.exports = {
  middlewareMock,
  middlewareDefToArgs,
  middlewareTypeErrCheck,
  middlewareFnFromDef
}
