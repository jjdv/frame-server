'use strict';

const { toReadOnlyProps } = require('./helpers-object')

module.exports = function Status(props) {
    const intV = {error: false}
    Object.defineProperties(this, {
        error: {
            get: () => intV.error
        },
        reset: {
            value: () => {intV.error = false}
        }
    })

    if (!props) {
        Object.defineProperty(this, 'reportErr', {
            value: (...errMsgs) => reportErr(intV, ...errMsgs)
        })
    } else {
        if (Array.isArray(props)) {
            for (let prop of props) {
                if (!prop || typeof prop !== 'string') {
                    console.error('Error: Invalid property name for creating Status instance: ', prop, '\nExpected non-empty string ... Property skipped.')
                    continue
                }
                this[prop] = {}
                intV[prop] = {error: false}
                Object.defineProperties(this[prop], {
                    reportErr: {
                        value: (...errMsgs) => reportErr([intV, intV[prop]], ...errMsgs)
                    },
                    error: {
                        get: () => intV[prop].error
                    },
                    reset: {
                        value: () => {intV[prop].error = false}
                    }
                })
            }
            toReadOnlyProps(this)
        } else console.error('Error: Invalid arguments for creating Status instance: ', props, '\nExpected array ...')
    }
}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function reportErr(status, ...errMsgs) {
    if (errMsgs.length) console.error('Error: ', ...errMsgs)
    if (Array.isArray(status)) status.forEach(statusEl => statusEl.error = true)
    else status.error = true
}
