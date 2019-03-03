'use strict';

module.exports = {
    // parameters of the server configuration file to look for at the site location
    fileName: 'server.config.js',
    dirs: ['./server', './config', './server/config', './config/server', '.'],
    
    serverConfig: {

        // serverRootDir is the starting point in the file resolution process
        // process.env.INIT_CWD is the original WD where the script was called from
        serverRootDir: process.env.INIT_CWD || process.cwd(),
    
        // siteRootDir relative to serverRootDir or absolute (path resolution with path.resolve)
        siteRootDir: 'dist',

        // view, if defined, must be an object with 'engine' and view 'dir' specifications. Both properties are optional. The 'dir' is relative to the serverRootDir or absolute.
        view: null,
        /* example view specification:
        view: {
            engine: 'pug',
            dir: 'server/views'
        },
        */

        // 'noHelmet' property can be set to true to get rid of the cli questions about the 'helmet' package
        noHelmet: false,

        // available values for middlewares installed by the server are:
        // ['helmet', 'cookies', 'session', 'json', 'urlencoded', 'multipart']
        serverMiddlewares: [],
        /* example serverMiddlewares specification:
        serverMiddlewares: [
            'helmet',
            {
                name: 'cookies',
                options: 'Shh, its a secret!'
            },
            {
                name: 'session',
                options: {
                    secret: 'Shh, its a secret!',
                    resave: false,
                    saveUninitialized: false,
                }
            },
            'json', 'urlencoded', 'multipart'
        ]*/
        
        // middlewares / routers to be used prior to the dynamic files and static files
        siteMiddlewaresDir: null,
        siteMiddlewares: null,
    
        // dedicated files to be served for specified route paths
        serveDynamicFiles: null,
        /* example serveDynamicFiles specification:
        serveDynamicFiles: {
            routePaths: ['/', 'users', 'info'],
            name: 'index.html'
        },*/
    
        // static files to be served from defined root directories with static route paths 
        serveStaticFiles: 'dist', // can be just string with the 'dir' value relative to serverRootDir
        /* example serveStaticFiles specification:
        serveStaticFiles: {
            routePaths: '/public', // optional, only if you need url prefix(es) for static resources
            dir: 'dist', // mandatory
            options: {} // optional, when you want some specific 'serve-static' configuration
        },*/

        // wrong request handler
        wrongRequestHandler: null,
    
        // server port to be used
        port: 3000,
    }
}
