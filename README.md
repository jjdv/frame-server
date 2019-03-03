# Frame Server

## Table of Content
<!-- vscode-markdown-toc -->
* 1\. [Overview](#Overview)
* 2\. [Installation](#Installation)
* 3\. [Run the server](#Runtheserver)
* 4\. [Configuration](#Configuration)
	* 4.1. [Reference directories and file/directory resolution](#Referencedirectoriesandfiledirectoryresolution)
	* 4.2. [Running the server without any configuration file](#Runningtheserverwithoutanyconfigurationfile)
	* 4.3. [Basic configuration options](#Basicconfigurationoptions)
		* 4.3.1. [Route paths](#Routepaths)
		* 4.3.2. [Dynamic files](#Dynamicfiles)
		* 4.3.3. [Static files](#Staticfiles)
	* 4.4. [Advanced options](#Advancedoptions)
		* 4.4.1. [Server middlewares](#Servermiddlewares)
		* 4.4.2. [Site middlewares](#Sitemiddlewares)
		* 4.4.3. [Views definition](#Viewsdefinition)
	* 4.5. [Configuration example](#Configurationexample)
* 5\. [Automatic server reload](#Automaticserverreload)
* 6\. [License](#License)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->


##  1. <a name='Overview'></a>Overview
Frame server was built to structure and automate the process of creating Node.js/Express server. Instead of writing (or copying and modifying) a similar frame code every time you can just define your standard server elements in a config file and let the Frame Server build up the server for you. At the same time it's flexible enough to accept your own middlewares specific to your site.

Check out the [frame-server-example](https://github.com/jjdv/frame-server-example) to see the Frame Server in action,

##  2. <a name='Installation'></a>Installation
No surprises, just hit in a terminal from your main project directory:
```
npm install frame-server
```
You can also install the Frame Server globally with `npm install frame-server -g` but it's not recommended - it leads to inconsistent dependency structure. In such case you will have to have your server dependencies (like cookie-parse, pug, multer) installed globally as well.

##  3. <a name='Runtheserver'></a>Run the server
To run the server installed locally put the command `fserver` in the package.json script command like below:
```
  "scripts": {
    "start": "fserver"
  },
```
In case of a global installation enter in your terminal, in your main project directory, the command `fserver`.

##  4. <a name='Configuration'></a>Configuration
This is where the server ease-of-use and flexibility shows up. There are several scenarios possible, presented in the next sections. You can run the server without any configuration file in the simplest case. If you need a more tailored solution, provide a server configuration definition in the file `server.config.js`. Assuming you will run the server with a terminal, in your main project directory, put your config file there or in any of the following directories relative to it (i.e. relative to CWD when starting the server): `./server`, `./config`, `./server/config` or `./config/server`.

To apply a specific configuration file or use a non-standard directory, provide your configuration file as an argument:
```
fserver --conf <path-to-conf-file>
fserver -c <path-to-conf-file>
```

###  4.1. <a name='Referencedirectoriesandfiledirectoryresolution'></a>Reference directories and file/directory resolution
Frame Server uses two reference directories:
- serverRootDir - the server starting point in the file resolution process. Defaults to CWD when starting the server.
- siteRootDir - where the site files to be served are located. Defaults to serverRootDir + '/dist'

Both serverRootDir and siteRootDir can be overwritten in the `server.config.js`.

Any other files and directories specified in the server configuration file can be provided relative to one of these reference directories or as an absolute path. See the description of a specific parameter to make sure which reference directory is used for that parameter.

###  4.2. <a name='Runningtheserverwithoutanyconfigurationfile'></a>Running the server without any configuration file
If you need just a basic server for a development process you don't have to bother with any configuration file. In such case the server defaults are applied and you get:
- a static server for any files located in the `dist` directory,
- the file `dist/index.html` provided for the base url "/",
- the server available under http://localhost:3000 (or at the port set in process.env.PORT).

###  4.3. <a name='Basicconfigurationoptions'></a>Basic configuration options
If you need the basic functionality described above but you have some other parameters to be applied, put them in the config file like this:
```
module.exports = {
    serverRootDir: 'my/absolute/server/dir',
    siteRootDir: 'site-dir',        // relative to serverRootDir or absolute

    // dynamic files to be served for specific paths
    serveDynamicFiles: {
        routePaths: ['/', 'about', 'contact'],    // site urls
        name: 'my-dynamic-file.html'              // relative to siteRootDir or absolute
    },

    // static files to be served
    serveStaticFiles: {
        routePaths: '/public',     // url prefix used for static files
        dir: 'site-dir/static',    // relative to serverRootDir or absolute
        options: {}                // you can specify options for the 'serve-static' middleware
    },

    // server port to be used
    port: 8080,
}
```

####  4.3.1. <a name='Routepaths'></a>Route paths
Wherever route paths can be specified they may be provided in `routePaths` property in [any way accepted by Express](https://expressjs.com/en/4x/api.html#app.get.method), i.e.:
- A string representing a path.
- A path pattern.
- A regular expression pattern to match paths.
- An array of combinations of any of the above.

####  4.3.2. <a name='Dynamicfiles'></a>Dynamic files
In order to serve a specific file for defined route paths it's enough to provide those data in the `serveDynamicFiles` property. In this field, as shown above, you define the `routePaths` and your dynamic file to be served. If you have more files to be served that way, provide an array of such definitions.

####  4.3.3. <a name='Staticfiles'></a>Static files
The Frame Server uses [serve-static](https://expressjs.com/en/resources/middleware/serve-static.html), provided by Express, to handle static files. In the `serveStaticFiles` field provide the parameters for the 'serve-static' middleware, i.e. `dir` as your static directory and 'serve-static' `options`. You can also provide route paths if you want some url prefix for your static resources. As with dynamic files, you can provide an array of objects if you need to handle static files from a few directories.

###  4.4. <a name='Advancedoptions'></a>Advanced options
Finally, in addition to a lightweight, quick server solutions, Frame Server can serve as a frame of an advanced, fully fledged internet server. This is thanks to the additional configuration options described in the following subsections.

####  4.4.1. <a name='Servermiddlewares'></a>Server middlewares
In case you need any typical middlewares/parsers it's enough to list them in an array in the `serverMiddlewares` field. The available middlewares/parsers are:
```
serverMiddlewares: [ 'helmet', 'cookies', 'session', 'json', 'urlencoded', 'multipart' ]
```
where the mapping to the respective packages is defined as:
```
    helmet: 'helmet',
    cookies: 'cookie-parser',
    session: 'express-session',
    json: 'express.json',
    urlencoded: 'express.urlencoded',
    multipart: 'multer'
```

Yes, you may provide options to those middlewares by providing an object instead of string with two properties: `name` with a middleware name as listed above and `options` for tailored middleware configuration. Here is an example:
```
serverMiddlewares: [
    'helmet', 'cookies',
    {
        name: 'session',
        options: {secret: 'Shh, its a secret!'}
    },
    {  
        name: 'urlencoded',
        options: { extended: true }
    },
    'json', 'multipart'
]
```

If the server middlewares are defined in the configuration file before installation of the Frame Server, the server will add them to the installation process automatically.

Following the server security guidelines in the [Express documentation](https://expressjs.com/en/advanced/best-practice-security.html#use-helmet), the use of 'helmet' package is advised during the server installation and initialization. If you use the server locally, you can get rid of this extra question during the server start by adding the config option:
```
noHelmet: true
```
Alternatively, start the server with `--no-helmet` argument, i.e. `fserver --no-helmet`.

####  4.4.2. <a name='Sitemiddlewares'></a>Site middlewares
Server middlewares/parsers are provided automatically (based on your config definition) to allow you to focus on your own, specific middlewares needed for your site. To include your own middlewares define them in the `siteMiddlewares` configuration option. Your middleware definition should have one of the three possible forms:
1. string `'path/to/my/middleware'`, absolute or relative to `serverRootDir` - will be resolved, required and applied with `app.use( yourMiddleware )`
2. your middleware - will be applied with `app.use( yourMiddleware )`
3. object `{routePaths: '/route/path', middleware: string|function as in 1-2 above}` - will be applied with `app.use(routePaths, middleware)`

Another form of `siteMiddlewares` value is available to provide more than one middlewares:

4. array of any elements 1-3 above - middlewares will be applied according to the array order

The middlewares are applied after the server middlewares and before serving dynamic and static files. This way you can overwrite those functions as needed.

If you find convenient to specify a reference directory for the middleware modules provide it in the `siteMiddlewaresDir` property in the config file:
```
siteMiddlewaresDir: 'server/middlewares',
```
The middlewares directory should be specified relative to the `serverRootDir` or absolute.

####  4.4.3. <a name='Viewsdefinition'></a>Views definition
To complement the configuration options the server can configure the views for you in the Express environment. Just add to your config options the `view` property with default `engine` extension and/or `dir` as the directory where the view files are located:
```
view: {
    engine: 'pug',
    dir: 'server/views'     // relative to serverRootDir or absolute
}
```
This will be used in `app.set('view engine', view.engine)` and `app.set('views', view.dir)` statements when setting up the server for you. The view settings are applied before any middleware to allow making use of them in your code.

###  4.5. <a name='Configurationexample'></a>Configuration example
If you'd like to see or play with some example implementations of the Frame Server with advanced configuration options, check out the [frame-server-example](https://github.com/jjdv/frame-server-example).

##  5. <a name='Automaticserverreload'></a>Automatic server reload
For automatic server reload after a file change, you can use [nodemon](https://nodemon.io/). This is a great tool with plenty of configuration options. Once you have the nodemon installed, change the script entry in the package.json, which starts the Frame Server, to something like:
```
  "scripts": {
    "start": "nodemon node_modules/frame-server/bin/frame-server.cli.js"
  },
```

##  6. <a name='License'></a>License
The Frame Sever is provided under the MIT License.