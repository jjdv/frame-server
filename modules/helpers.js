'use strict';

function exit(...errMsg) {
    console.error(...errMsg)
    process.exit(9)
}

module.exports = { exit }
