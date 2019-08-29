const path = require('path')

const rootDir = path.resolve(__dirname, '../../../..')
const {
  configFileName,
  configDirs
} = require('../../../config/server.config.ini')
const lookupConfigPaths = configDirs.map(dir =>
  path.resolve(rootDir, dir, configFileName)
)

const cliDir = 'testdir'
const cliConfigFile = path.join(cliDir, configFileName)
const cliTest = {
  dir: cliDir,
  absPath: path.resolve(rootDir, cliDir, configFileName),
  argv: [
    ['aaa', '--conf', cliConfigFile],
    ['aaa', 'bbb', '--conf', cliConfigFile + 'ccc'],
    ['aaa', '-c', cliConfigFile + 'ddd'],
    ['aaa', 'bbb', '-c', cliConfigFile]
  ],
  validTestArgvIndexes: [0, 3],
  invalidTestArgvIndexes: [1, 2]
}

const localConfigData = [
  {
    rootDir: 'testRootDir',
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
    serverMiddlewares: ['test1', { name: 'test2' }],
    siteMiddlewaresDir: 'mDir',
    siteMiddlewares: ['siteM1', () => {}],
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
    rootDir: rootDir,
    view: null,
    noHelmet: false,
    serveDynamicFiles: null,
    serveStaticFiles: 'dist'
  }
]

const __dirnameIndex = 0

module.exports = {
  lookupConfigPaths,
  cliTest,
  localConfigData,
  returnIniConfigData,
  __dirnameIndex
}
