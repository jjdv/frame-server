const path = require('path')

const rootDir = path.resolve(__dirname, '../../../../..')
const {
  configFileName,
  configDirs
} = require('../../../../modules/config/data/config-base-data')
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

const correctLocalConfigData = [
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

const errValidationResFormat = (varName, pathDef) => [
  'Error: ',
  `Wrong directory format of '${varName}':`,
  pathDef
]

const errValidationResPath = (varName, pathDef) => [
  'Error: ',
  `Cannot find directory "${pathDef}" specified in '${varName}'.`
]

const errPortRes = port => [
  'Error: ',
  'Provided port must be an integer above 0 but it is: ',
  port
]

const incorrectLocalConfigData = [
  {
    conf: { rootDir: [] },
    errArgs: errValidationResFormat('rootDir', [])
  },
  {
    conf: { rootDir: 'abc' },
    errArgs: errValidationResPath('rootDir', 'abc')
  },
  {
    conf: { siteRootDir: [] },
    errArgs: errValidationResFormat('siteRootDir', [])
  },
  {
    conf: { siteRootDir: 'def' },
    errArgs: errValidationResPath('siteRootDir', path.resolve(rootDir, 'def'))
  },
  {
    conf: { port: [] },
    errArgs: errPortRes([])
  },
  {
    conf: { port: 0 },
    errArgs: errPortRes(0)
  }
]

module.exports = {
  rootDir,
  lookupConfigPaths,
  cliTest,
  correctLocalConfigData,
  incorrectLocalConfigData
}
