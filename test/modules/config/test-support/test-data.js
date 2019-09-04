const path = require('path')

const rootDir = path.resolve(__dirname, '../../../../..')
const {
  configFileName,
  configDirs
} = require('../../../../modules/config/config.data')
const lookupConfigPaths = configDirs.map(dir =>
  path.resolve(rootDir, dir, configFileName)
)

const cliDir = 'testdir'
const cliConfigFile = path.join(cliDir, configFileName)
const postfix = 'ccc'
const cliTest = {
  cliConfigFile,
  absPath: path.resolve(rootDir, cliDir, configFileName),
  correctConfArgv: [
    ['aaa', '--conf', cliConfigFile],
    ['aaa', 'bbb', '-c', cliConfigFile]
  ],
  postfix,
  incorrectConfArgv: [
    ['aaa', 'bbb', '--conf', cliConfigFile + postfix],
    ['aaa', '-c', cliConfigFile + postfix]
  ]
}

const localConfigData = [
  {
    rootDir: 'c:\\testRootDir',
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

module.exports = {
  lookupConfigPaths,
  cliTest,
  localConfigData
}
