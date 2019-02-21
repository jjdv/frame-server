'use strict';

module.exports = {
    fileName: 'server.config.js',
    dirs: ['./server', './config', './config/server', '.'],
    
    serverConfig: {
    
        // siteRoot relative to CWD or absolute (path resolution with path.resolve)
        siteRoot: 'dist',

        // available values for middlewares installed by the server are:
        // [ 'helmet', 'json', 'url', 'multipart', 'cookies', 'session' ]
        serverMiddlewares: [],
        
        // middlewares / routers to be used prior to the served file and static files
        // absolute path has to be provided for 'require()' request
        siteMiddlewares: null,
    
        // dedicated file to be served for specified paths or all paths if no path is specified
        // possible formats: falsy, string, object, array. detailed format info in 'files-router.js'
        serveFileDef: 'index.html',
    
        // static file extensions to be handled with static paths (and ignored when handling dedicated files)
        staticFileExt: ['js', 'css', 'jpg', 'png', 'svg', 'ico', 'map', 'pdf'],
    
        // server port to be used
        port: 3000,

        // view, if defined, must be an object with 'engine' and view 'dir' specifications. The 'dir' is relative to the siteRoot.
        view: null,
        /* example view specification:
        view: {
            engine: 'pug',
            dir: 'views'
        },
        */

        // 'noHelmet' property can be set to true to get rid of the cli questions about the 'helmet' package
        noHelmet: false
    }
}
