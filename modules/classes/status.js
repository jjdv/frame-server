'use strict'

module.exports = class Status {
  constructor (props) {
    if (!props) setupGlobalProps.call(this)
    else if (Array.isArray(props) && props.length) {
      setupGlobalProps.call(this)
      for (const prop of props) {
        if (!prop || typeof prop !== 'string') {
          console.error(
            'Error: Invalid property name for creating Status instance: ',
            prop,
            '\nExpected non-empty string ... Property skipped.'
          )
          continue
        }

        this[prop] = {
          error: false,
          reportErr: (...errMsgs) => {
            this[prop].error = true
            reportError.apply(this, errMsgs)
          },
          reset: () => (this[prop].error = false)
        }
      }
    } else {
      console.error(
        'Error: Invalid arguments for creating Status instance:',
        props,
        '\nExpected a non-empty string array ...'
      )
    }
  }

  reset () {
    this.error = false
    for (const prop in this) {
      if (!['error', 'reportErr', 'reset'].includes(prop)) this[prop].reset()
    }
  }
}

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function setupGlobalProps () {
  this.error = false
  this.reportErr = reportError
}

function reportError (...errMsgs) {
  this.error = true
  if (errMsgs.length) console.error('Error: ', ...errMsgs)
}
