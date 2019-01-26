'use strict';

module.exports = {
    fileName: 'server.config.js',
    dirs: ['./server', './config', './config/server', '.'],
    rootDir: process.cwd(),
    
    serverConfig: {
    
        // siteRoot relative to CWD or absolute (path resolution with path.resolve)
        siteRoot: 'dist',
    
        // middleware / routers to be used prior to the served files defined below
        // absolute path has to be provided for 'require()' request
        siteMiddleware: null,
    
        // dedicated files to be served for specified paths or all paths if no path is specified
        // possible formats: falsy, string, object, array. detailed format info in 'files-router.js'
        serveFileDef: 'index.html',
    
        // static file extensions to be handled with static paths (and ignored when handling dedicated files)
        staticFileExt: ['js', 'css', 'jpg', 'png', 'svg', 'ico', 'pdf'],
    
        // server port to be used
        port: 3000,
    }
}
