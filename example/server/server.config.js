module.exports =  {

    // siteRootDir relative to CWD or absolute (path resolution with path.resolve)
    siteRootDir: 'dist',

    // view, if defined, must be an object with 'engine' and view 'dir' specifications. The 'dir' is relative to the siteRootDir.
    view: {
        engine: 'pug',
        dir: './server/views'
    },

    // 'noHelmet' property can be set to true to get rid of the cli questions about the 'helmet' package
    noHelmet: true,

    // available values for middlewares installed by the server are:
    // [ 'helmet', 'json', 'urlencoded', 'multipart', 'cookies', 'session' ]
    serverMiddlewares: [
        //'helmet',
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
                cookie: { httpOnly: false }
            }
        },
        {  
            name: 'urlencoded',
            options: { extended: false }
        },
        'json', 'multipart',
    ],
    
    // middlewares / routers to be used prior to the served file and static files
    // absolute path has to be provided for 'require()' request
    siteMiddlewaresDir: './server/middlewares',
    siteMiddlewares: [
        {
            routePaths: ['/cookies/:cmd/:name/:value', '/cookies/:cmd/:name', '/cookies/:cmd', '/cookies'], // cmd = set | delete
            middleware: 'cookies-test.js'
        },
        {
            routePaths: '/session',
            middleware: 'session-test.js'
        },
        {
            routePaths: '/form/:type',
            middleware: 'form-test.js'
        }
    ],

    // dedicated file to be served for specified paths or all paths if no path is specified
    // possible formats: falsy, string, object, array. detailed format info in 'files-router.js'
    serveDynamicFiles: [
        {
            routePaths: ['/dyn1', '/dyn2'],
            fileName: 'dynamic1.html'
        },
        {
            routePaths: ['/d1', '/d2'],
            fileName: 'dynamic2.html'
        }
    ],

    // wrong request handler
    wrongRequestHandler: 'server/middlewares/wrong-request.js',

    // static file extensions to be handled with static paths (and ignored when handling dedicated files)
    //staticFileExt: ['js', 'css', 'jpg', 'png', 'svg', 'ico', 'map', 'pdf'],

    // server port to be used
    port: 3000,
}
