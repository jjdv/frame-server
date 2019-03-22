const path = require('path')

const Middlewares = require('../classes/class-middlewares')
const { filePathNotEmpty, routePathsErr } = require('../helpers/helpers-basic')

function validateDynamicFilesDef (serveDynamicFilesDef, status) {
  Middlewares.validate(serveDynamicFilesDef, validateDynamicFileDef, status)
}

function dynamicFilesMiddlewares (serveDynamicFilesDef) {
  serveDynamicFilesDef = normalizeDynamicFilesDef(serveDynamicFilesDef)
  return Middlewares.fromDef('serveDynamicFiles', serveDynamicFilesDef)
}

module.exports = { validateDynamicFilesDef, dynamicFilesMiddlewares }

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function validateDynamicFileDef (fileDef, index, status) {
  if (typeof fileDef !== 'object') status.reportErr(`Definition in 'serveDynamicFiles' must be an object and not: `, fileDef)
  else {
    if (!fileDef.routePaths) status.reportErr(`Missing 'routePaths' definition in 'serveDynamicFiles', item ${index + 1}.`)
    else routePathsErr(fileDef.routePaths, `'routePaths' in 'serveDynamicFiles', item ${index + 1}`, status)
    if (!fileDef.fileName) status.reportErr(`Missing 'fileName' definition in 'serveDynamicFiles', item ${index + 1}.`)
    else {
      const siteRootDir = process.env.siteRootDir
      filePathNotEmpty(fileDef.fileName, siteRootDir, `'fileName' in 'serveDynamicFiles', item ${index + 1}`, status)
    }
  }
}

function normalizeDynamicFilesDef (serveDynamicFilesDef) {
  const siteRootDir = process.env.siteRootDir
  if (!Array.isArray(serveDynamicFilesDef)) serveDynamicFilesDef = [ serveDynamicFilesDef ]
  return serveDynamicFilesDef.map(dfDef => ({
    name: mName(dfDef.fileName),
    middleware: getDynamicFileFn(dfDef.fileName, siteRootDir),
    routePaths: dfDef.routePaths,
    type: 'get'
  }))
}

function mName (fileName) {
  return fileName.match(/[^\\/]+$/)[0]
}

function getDynamicFileFn (fileName, siteRootDir) {
  const filePath = path.resolve(siteRootDir, fileName)
  return (req, res) => res.sendFile(filePath)
}
