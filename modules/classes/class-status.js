'use strict'

const { toReadOnlyProps } = require('../helpers/object')

module.exports = class Status {
  constructor(props) {
    this.error = false
    if (!props) {
      this.reportErr = (...errMsgs) => {
        this.error
        if (errMsgs.length) console.error('Error: ', ...errMsgs)
      }
    } else if (Array.isArray(props)) {
      for (let prop of props) {
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
            this.error = true
            this[prop].error = true
            if (errMsgs.length) console.error('Error: ', ...errMsgs)
          }
        }
      }
    } else
      console.error(
        'Error: Invalid arguments for creating Status instance: ',
        props,
        '\nExpected array ...'
      )
  }
}
