'use strict'

import { validatedDirectory } from '../helpers/validators'

function getView (config, status) {
  if (config.view) {
    validateView(config.view, status)
    if (!status.error) {
      const setView = require('../modules/deployment/set-view')
      return { apply: app => setView(app, config.view) }
    }
  }
  return null
}

module.exports = {
  getView,
  validateView // for test purposes
}

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function validateView (view, status) {
  if (view.constructor !== Object) {
    status.reportErr(
      'Wrong format of the view definition in the server config file:',
      view
    )
    return
  }
  if (view.engine && typeof view.engine !== 'string') {
    status.reportErr(
      'view.engine in the server config file must be a string, not: ',
      view.engine
    )
  }
  if (view.dir) {
    const rootDir = process.env.APP_ROOT_DIR
    if (typeof view.dir === 'string') {
      validatedDirectory('view.dir', view.dir, rootDir, status)
    } else if (Array.isArray(view.dir)) {
      view.dir.forEach(dir =>
        validatedDirectory('view.dir', dir, rootDir, status)
      )
    } else {
      status.reportErr(
        'view.dir in the server config file must be a string or an array of strings, not: ',
        view.dir
      )
    }
  }
}
