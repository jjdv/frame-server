
const path = require('path')

const serverRootDir = path.resolve(__dirname, '../../../..')
const { configFileName, configDirs } = require('../../../config/config.ini')
const lookupConfigPaths = configDirs.map(dir => path.resolve(serverRootDir, dir, configFileName))

const cliDir = 'testdir'
const cliConfigFile = path.join(cliDir, configFileName)
const cliTest = {
  dir: cliDir,
  absPath: path.resolve(serverRootDir, cliDir, configFileName),
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

const __dirnameIndex = 0

module.exports = { lookupConfigPaths, cliTest, localConfigData, returnIniConfigData, __dirnameIndex }
