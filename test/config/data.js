
const path = require('path')

const serverRootDir = path.resolve(__dirname, '../..')
const { configFileName, configDirs } = require('../../config/config.ini')
const lookupConfigPaths = configDirs.map(dir => path.resolve(serverRootDir, dir, configFileName))

const cliDir = 'testdir'
const cliPath = path.resolve(serverRootDir, cliDir, configFileName)

const localConfigData = [
  {
    serverRootDir: 'testRootDir',
    view: {
      test: 'testView'
    },
    noHelmet: true,
    serveDynamicFiles: {
      routePaths: ['/', 'users', 'info'],
      name: 'index.html'
    }
  },
  {
    serverMiddlewares: [ 'test1', { name: 'test2' } ],
    siteMiddlewaresDir: 'mDir',
    siteMiddlewares: [ 'siteM1', () => {} ],
    wrongRequestHandler: () => {}
  }
]

const returnIniConfigData = [
  {
    siteRootDir: 'dist',
    serverMiddlewares: null,
    installServerMiddlewares: true,
    siteMiddlewaresDir: null,
    siteMiddlewares: null,
    wrongRequestHandler: null
  },
  {
    serverRootDir: serverRootDir,
    view: null,
    noHelmet: false,
    serveDynamicFiles: null,
    serveStaticFiles: 'dist'
  }
]

const invalidConfigPaths = [ 'abc', 'invalid' ].map(dir => path.resolve(serverRootDir, dir, 'aaa'))

module.exports = { lookupConfigPaths, cliDir, cliPath, localConfigData, returnIniConfigData, invalidConfigPaths }
