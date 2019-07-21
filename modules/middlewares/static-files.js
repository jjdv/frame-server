const path = require('path')
const express = require('express')

const Middlewares = require('../classes/middlewares')
const { filePathNotEmpty, routePathsErr } = require('../helpers/basic')

function validateStaticFilesDef(serveStaticFilesDef, status) {
  Middlewares.validate(serveStaticFilesDef, validateDirDef, status)
}

function staticFilesMiddlewares(serveStaticFilesDef) {
  serveStaticFilesDef = normalizeStaticFilesDef(serveStaticFilesDef)
  const applyMsg =
    "Static files, definded by 'serveStaticFiles', will be provided from directories: "
  return Middlewares.fromDef(
    'serveStaticFiles',
    serveStaticFilesDef,
    {},
    applyMsg
  )
}

module.exports = { validateStaticFilesDef, staticFilesMiddlewares }

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function validateDirDef(dirDef, index, status) {
  if (typeof dirDef === 'string') dirDef = { dir: dirDef }
  if (typeof dirDef !== 'object')
    status.reportErr(
      `Definition in 'serveStaticFiles' must be an object and not: `,
      dirDef
    )
  else {
    if (!dirDef.dir)
      status.reportErr(
        `Missing 'dir' definition in 'serveStaticFiles', item ${index + 1}.`
      )
    else {
      const serverRootDir = process.env.SERVER_ROOT_DIR
      filePathNotEmpty(
        dirDef.dir,
        serverRootDir,
        `'dir' in 'serveStaticFiles', item ${index + 1}`,
        status
      )
    }
    if (dirDef.routePaths)
      routePathsErr(
        dirDef.routePaths,
        `'routePaths' in 'serveStaticFiles', item ${index + 1}`,
        status
      )
    if (dirDef.options && typeof dirDef.options !== 'object') {
      status.reportErr(
        `'options' definition in 'serveStaticFiles', item ${index +
          1}, must be an object and not: `,
        dirDef.options
      )
    }
  }
}

function normalizeStaticFilesDef(serveStaticFilesDef) {
  const serverRootDir = process.env.SERVER_ROOT_DIR
  if (!Array.isArray(serveStaticFilesDef))
    serveStaticFilesDef = [serveStaticFilesDef]
  return serveStaticFilesDef.map(dirDef => {
    if (typeof dirDef === 'string') dirDef = { dir: dirDef }
    return {
      name: dirDef.dir,
      middleware: express.static(
        path.resolve(serverRootDir, dirDef.dir),
        dirDef.options || {}
      ),
      routePaths: dirDef.routePaths
    }
  })
}
