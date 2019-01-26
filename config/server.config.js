'use strict';

const { fileName, dirs, rootDir, serverConfig } = require('./config.ini')
const { getConfPath } = require('../modules/helpers')
const processConfigData = require('../modules/process-config-data')

const localConfPath = getConfPath(rootDir, dirs, fileName)

// getConfPath makes sure to provide valid path or null
if (localConfPath) {
    const localConf = require( localConfPath )
    
    serverConfig = {
        ...serverConfig,
        
        // merge default ini config with local server config
        ...localConf
    }
}

// if the config data are wrong, processConfigData reports errors and terminates the process
// also relative paths are changed into absolute and RegExp for file extensions is generated
serverConfig = processConfigData(rootDir, serverConfig)

module.exports = serverConfig
