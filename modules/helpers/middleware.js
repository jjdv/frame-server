const { filePathNotEmpty, routePathsErr, nameErr } = require('./basic')
const Status = require('../classes/status')

const middlewareMock = {
  name: undefined,
  middlewareFn: null,
  apply: () => {}
}

function middlewareArgsErr(
  middlewareName,
  middlewareFn,
  routePaths,
  type,
  status
) {
  const intStatus = new Status()

  middlewareNameErrCheck(middlewareName, middlewareFn, intStatus)
  middlewareFnErrCheck(middlewareFn, middlewareName, intStatus)
  if (routePaths) routePathsErr(routePaths, middlewareName, intStatus)
  middlewareTypeErrCheck(type, middlewareName, intStatus)

  if (intStatus.error && status) status.reportErr()
  return intStatus.error
}

function middlewareFnFromDef(middlewareDef, middlewareName, rootDir) {
  if (!rootDir) rootDir = process.env.SERVER_ROOT_DIR
  switch (middlewareDef.constructor) {
    case String:
      const mPath = filePathNotEmpty(
        middlewareDef,
        rootDir,
        middlewareName,
        new Status()
      )
      return mPath ? require(mPath) : null
    case Function:
      return middlewareDef
    default:
      const extraInfo =
        middlewareName && typeof middlewareName === 'string'
          ? `in the middleware: ${middlewareName}`
          : null
      console.error(
        'Error: Invalid format of the middleware: ',
        middlewareDef,
        extraInfo
      )
      return null
  }
}

module.exports = { middlewareMock, middlewareArgsErr, middlewareFnFromDef }

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function middlewareNameErrCheck(middlewareName, middlewareFn, status) {
  return nameErr(middlewareName, 'middleware', middlewareFn, status)
}

function middlewareFnErrCheck(middlewareFn, middlewareName, status) {
  if (!middlewareFn) status.reportErr('No middleware function provided.')
  else if (middlewareFn.constructor !== Function) {
    const extraInfo =
      middlewareName && typeof middlewareName === 'string'
        ? `provided for the middleware: ${middlewareName}.`
        : ''
    status.reportErr(
      'Invalid format of middleware function: ',
      middlewareFn,
      extraInfo
    )
  }
}

middlewareTypeErrCheck = function(type, middlewareName, status) {
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
    const extraInfo =
      middlewareName && typeof middlewareName === 'string'
        ? `provided for the middleware: ${middlewareName}.`
        : ''
    status.reportErr('Invalid middleware type: ', type, extraInfo)
  }
}
