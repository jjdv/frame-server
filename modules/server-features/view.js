'use strict'

import { validatedDirectory } from '../helpers/error-reporters'

function validateViewConfig (viewConfig, status) {
  if (viewConfig.constructor !== Object) {
    status.reportErr(
      'Wrong format of the view definition in the server config file:',
      viewConfig
    )
    return
  }
  if (viewConfig.engine && typeof viewConfig.engine !== 'string') {
    status.reportErr(
      'view.engine in the server config file must be a string, not: ',
      viewConfig.engine
    )
  }
  if (viewConfig.dir) {
    const rootDir = process.env.APP_ROOT_DIR
    if (typeof viewConfig.dir === 'string') {
      validatedDirectory('view.dir', viewConfig.dir, rootDir, status)
    } else if (Array.isArray(viewConfig.dir)) {
      viewConfig.dir.forEach(dir =>
        validatedDirectory('view.dir', dir, rootDir, status)
      )
    } else {
      status.reportErr(
        'view.dir in the server config file must be a string or an array of strings, not: ',
        viewConfig.dir
      )
    }
  }
}

function getView (config, status) {
  if (config.view) {
    validateViewConfig(config.view, status)
    if (!status.error) {
      const setView = require('../modules/deployment/set-view')
      return { apply: app => setView(app, config.view) }
    }
  }
  return null
}

module.exports = {
  getView,
  validateViewConfig
}
