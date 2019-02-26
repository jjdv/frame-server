'use strict';

function ErrorBox() {
    let error = false

    Object.defineProperty(this, 'status', {
        get: function() { return error },
        set: function() { console.error('Error: attempt to write to ErrorBox status property!') }
    })

    this.report = function(...errMsg) {
        console.error(...errMsg)
        error = true
    }
}

function exit(...errMsg) {
    console.error(...errMsg)
    process.exit(9)
}

module.exports = { exit, ErrorBox }
