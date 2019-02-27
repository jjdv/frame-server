'use strict';

module.exports = {
    fileName: 'server.config.js',
    dirs: ['./server', './config', './config/server', '.'],
    
    serverConfig: {

        // serverRootDir is the starting point in the file resolution process
        serverRootDir: process.env.INIT_CWD || process.cwd(),
    
        // siteRootDir relative to CWD or absolute (path resolution with path.resolve)
        siteRootDir: 'dist',

        // view, if defined, must be an object with 'engine' and view 'dir' specifications. The 'dir' is relative to the siteRootDir.
        view: null,
        /* example view specification:
        view: {
            engine: 'pug',
            dir: 'views'
        },
        */

        // 'noHelmet' property can be set to true to get rid of the cli questions about the 'helmet' package
        noHelmet: false,

        // available values for middlewares installed by the server are:
        /*
        [
            'helmet', 'json', 'url', 'multipart',
            {
                name: 'cookies',
                options: 'Shh, its a secret!'
            },
            'session'
        ]*/
        serverMiddlewares: [],
        
        // middlewares / routers to be used prior to the served file and static files
        siteMiddlewaresDir: null,
        siteMiddlewares: null,
    
        // dedicated file to be served for specified route paths
        // possible formats: falsy, string, object, array. detailed format info in 'files-router.js'
        serveDynamicFiles: null,
        /*serveDynamicFiles: {
            routePaths: '/',
            name: 'index.html'
        },*/
    
        // static files to be handled with static route paths and directories
        serveStaticFiles: 'dist',
        /*serveStatic: {
            routePaths: '/public',
            dir: 'dist',
            options: {}
        },*/

        // wrong request handler
        wrongRequestHandler: null,
    
        // server port to be used
        port: 3000,
    }
}
