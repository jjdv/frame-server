'use strict';

const rootDir = process.env.INIT_CWD || process.cwd()

function exit(...errMsg) {
    console.error(...errMsg)
    process.exit(9)
}

module.exports = { rootDir, exit }
