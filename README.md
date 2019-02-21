# Frame Server

## Overview
Frame server was built to structure and automate creating Node/Express server. Instead of writing (or copying) a similar frame code every time you can just define your standard server elements in a config file and let the Frame Server build up the server for you. At the same time it's flexible enough to accept your own middleware specific to your site.

## Installation
No surprises, in the terminal from your main project directory just hit:
```
npm install frame-server
```

## Run the server
To run a server enter the command from your project directory:
```
fserver
```
If you want to apply a specific configuration file, provide it as an argument:
```
fserver --conf <path-to-conf-file>
fserver -c <path-to-conf-file>
```


## Configuration
This is where the server ease-of-use and flexibility shows up. There are several scenarios possible, presented in the next sections. You can run the server without any configuration file in the simplest case. If you need a more tailored solution, provide a server configuration definition in the file `server.config.js`. Assuming you will run the server with a terminal in your main project directory, put your config file there or in any of the following directories relative to it (i.e. relative to CWD when starting the server): `./server`, `./config` or `./config/server`.

### 1. Running the server without any configuration file
If you need just a basic server for the development process you don't have to bother with any configuration file. In such case the server defaults are applied so you get:
- a static server for any files with extensions `.js, .css, .jpg, .png, .svg, .ico, .map, .pdf` and
- for any other requests the file `index.html` is provided from your current working directory or the directory `dist` relative to it.
- the files are served from http://localhost:3000

### 2. Basic configuration options
If you need the basic functionality described above but you have some other parameters to be applied put them in the config file like this:
```
module.exports = {
    // siteRoot relative to CWD or absolute (path resolution with path.resolve)
    siteRoot: 'dist',

    // dedicated files to be served for all paths except paths with extensions specified in staticFileExt
    serveFileDef: 'index.html',

    // static file extensions to be handled with static paths
    staticFileExt: ['js', 'css', 'jpg', 'png', 'svg', 'ico', 'map', 'pdf'],

    // server port to be used
    port: 3000,
}
```

### 3. Defined paths
You can also specify paths for which the defined file is to be served. Just provide the `serveFileDef` value as an object with `file` property pointing to the dedicated file and `paths` property defining the paths to be used. So the configuration field will be similar to:
```
serveFileDef: {
    file: 'index.html',
    paths: <paths>
}
```
where `<paths>` can be provided in [any way accepted by Express](https://expressjs.com/en/4x/api.html#app.get.method), i.e.:
- A string representing a path.
- A path pattern.
- A regular expression pattern to match paths.
- An array of combinations of any of the above.

If you define paths for which the dedicated file should be provided, then the definition of the static file extensions (default or your own) is optional. You can overwrite it with `staticFileExt: null` to serve any static files, regardless of the extension.

### 4. Advanced options
Finally, in addition to a lightweight and quick server solutions, Frame Server can serve as a `frame` of an advanced, fully fledged internet server. This is thanks to the additional configuration options described in the following subsections.

#### 4.1 Server middlewares
In case you need any typical middlewares/parsers it's enough to list them in an array in the `serverMiddlewares` field. The available middlewares/parsers are:
```
serverMiddlewares: [ 'helmet', 'json', 'url', 'multipart', 'cookies', 'session' ]
```
where the mapping to the respective packages is defined as:
```
    helmet: 'helmet',
    json: 'body-parser', // body-parser.json
    url: 'body-parser', // body-parser.urlencoded
    multipart: 'multer',
    cookies: 'cookie-parser',
    session: 'express-session'
```
Yes, you may provide options to those middlewares by providing an object instead of string with two properties: `name` with values as above and `options` provided as an object. Here is an example:
```
serverMiddlewares: [
    'helmet', 'json', 'multipart', 'cookies',
    {  
        name: 'url',
        options: { extended: true }
    },
    {
        name: 'session',
        options: {secret: 'Shh, its a secret!'}
    }
]
```
If the server middlewares are defined in the configuration file before installation of Frame Server, the server will add them to the installation process automatically.

Following the server security guidelines in the [Express documentation](https://expressjs.com/en/advanced/best-practice-security.html#use-helmet), the use of 'helmet' package is encouraged during the server installation and initialization. If you use the server locally, you can get rid of this extra question during server start by adding the config option:
```
noHelmet: true
```
Alternatively, start the server in the command line with `--no-helmet` argument, i.e. `fserver --no-helmet`.

#### 4.2 Site middlewares
Server middlewares/parsers are provided automatically (based on your config definition) to allow you to focus on your own, specific middlewares needed for your site. To include your own middlewares provide the path to your middlewares definition object in the `siteMiddlewares` configuration option. The path should be absolute or relative to CWD. Your middlewares definition object should have one of the three possible forms:
1. string `'path/to/my/middleware'`, absolute or relative to CWD - will be applied with `app.use( path.resolve(rootDir, 'path/to/my/middleware') )`
2. your middleware - will be applied with `app.use( yourMiddleware )`
3. object `{paths: '/route/path', middleware: string|function as in 1-2 above}` - will be applied with `app.use(path, middleware)`
4. array of any elements 1-3 above - middlewares will be applied according to the array order

The middlewares are applied after the server middlewares and before serving the defined file (e.g. 'index.html') and static files so you can overwrite those functions as needed.

#### 4.3 Views definition
To complement configuration options the server can configure the views for you in the Express environment. Just add to your config options the `view` property with `engine` and `dir` where the files are located:
```
view: {
    engine: 'pug',
    dir: 'views'
}
```
This will be used in `app.set('view engine', view.engine)` and `app.set('views', view.dir)` statements when setting up the server for you.

## Roadmap
The is an alpha version of the software so some testing and patching needs to be done first.
The very fist new feature will be an integration with `nodemon`. I'm not sure if a dedicated directory for static files is really helpful. It can be easily added as an option anyway so probably I'll do it in some next release.
Definitely some automation for the API building is on my mind but it will require a bit more time.

## Contribution
Any ideas, suggestions, comments to the project or contribution volunteers are welcome :).

## License
The project is developed under the MIT License.