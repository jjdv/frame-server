'use strict'

const { toReadOnlyProps } = require('../helpers/object')

module.exports = class Status {
  constructor(props) {
    if (!props) setupGlobalProps.call(this)
    else if (Array.isArray(props) && props.length) {
      setupGlobalProps.call(this)
      for (let prop of props) {
        if (!prop || typeof prop !== 'string') {
          console.error(
            'Error: Invalid property name for creating Status instance: ',
            prop,
            'Expected non-empty string ... Property skipped.'
          )
          continue
        }

        this[prop] = {
          error: false,
          reportErr: (...errMsgs) => {
            reportError.apply(this, errMsgs)
            this[prop].error = true
          }
        }
      }
    } else
      console.error(
        'Error: Invalid arguments for creating Status instance: ',
        props,
        '\nExpected a non-empty string array ...'
      )
  }
}

// -----------------------------------------
// helpers
// -----------------------------------------

function setupGlobalProps() {
  this.error = false
  this.reportErr = reportError
}

function reportError(...errMsgs) {
  this.error = true
  if (errMsgs.length) console.error('Error: ', ...errMsgs)
}
