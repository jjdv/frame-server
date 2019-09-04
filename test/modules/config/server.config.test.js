/* eslint-env mocha */

const path = require('path')

// test environment
const { expect, sinon } = require('../../test-env')
const {
  fakeFs,
  resetFakePaths,
  addFakeDirPaths,
  addFakeFilePaths
} = require('../../../modules/helpers/fake-fs')
const {
  localConfigData,
  cliTest,
  lookupConfigPaths
} = require('./test-support/test-data')

// absolute paths for cache cleanup of the node's require function
const helpersBasicAbsPath = require.resolve('../../../modules/helpers/basic')
const errorReportersAbsPath = require.resolve(
  '../../../modules/helpers/error-reporters'
)
const serverConfigAbsPath = require.resolve(
  '../../../modules/config/server.config'
)
// cached 'config.ini' required value
const configIni = require('../../../modules/config/server.config.ini')

const basicRequireStub = sinon.stub()
const serverConfigRequireStub = sinon.stub()

let argvOriginal, consoleErrStub

function setTestEnv () {
  sinon.reset()
  basicRequireStub.callsFake(require)
  serverConfigRequireStub.returns(null)
  delete require.cache[helpersBasicAbsPath]
  delete require.cache[errorReportersAbsPath]
  delete require.cache[serverConfigAbsPath]
  resetFakePaths()
}

describe('config > server.config.js', function () {
  before(function () {
    argvOriginal = process.argv
    consoleErrStub = sinon.stub(console, 'error')
    global.testReplace = {
      'basic.js': {
        require: basicRequireStub
      },
      'server.config.js': {
        require: serverConfigRequireStub
      }
    }
  })

  after(function () {
    delete global.testReplace
    process.argv = argvOriginal
    sinon.restore()
  })

  beforeEach(function () {
    process.argv = argvOriginal.slice(0, 2)
    setTestEnv()
  })

  it('provides ini config if no local config is found', function () {
    basicRequireStub.withArgs('fs').returns({
      existsSync: () => false
    })
    const returnedConfigData = require('../../../modules/config/server.config')
    expect(returnedConfigData).to.deep.equal(configIni)
  })

  it('finds local config in any default directory and correctly merges ini and local configs', function () {
    let confIndex
    lookupConfigPaths.forEach((configPath, index) => {
      setTestEnv()
      confIndex = index % 2
      const localConfig = localConfigData[confIndex]
      const expectedConfigData = { ...configIni, ...localConfig }

      const siteRootDirAbsPath = path.resolve(
        expectedConfigData.rootDir,
        expectedConfigData.siteRootDir
      )
      addFakeFilePaths(configPath)
      addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
      basicRequireStub.withArgs('fs').returns(fakeFs)
      serverConfigRequireStub.withArgs(configPath).returns(localConfig)

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.deep.equal(expectedConfigData)
    })
  })

  it('finds local config specified in cli and correctly merges ini and local configs', function () {
    let confIndex
    cliTest.correctConfArgv.forEach((confArgv, index) => {
      setTestEnv()
      confIndex = index % 2
      const localConfig = localConfigData[confIndex]
      const expectedConfigData = { ...configIni, ...localConfig }

      const siteRootDirAbsPath = path.resolve(
        expectedConfigData.rootDir,
        expectedConfigData.siteRootDir
      )
      addFakeFilePaths(cliTest.absPath)
      addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
      basicRequireStub.withArgs('fs').returns(fakeFs)
      serverConfigRequireStub.withArgs(cliTest.absPath).returns(localConfig)
      process.argv = process.argv.concat(confArgv)

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.include(expectedConfigData)
    })
  })

  it('returns null and logs error when invalid config specified in cli', function () {
    cliTest.incorrectConfArgv.forEach(confArgv => {
      delete require.cache[serverConfigAbsPath]
      consoleErrStub.resetHistory()

      process.argv = process.argv.concat(confArgv)

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.be.null()
      consoleErrStub.should.have.been.calledOnceWithExactly(
        `Error: Server config file '${cliTest.cliConfigFile +
          cliTest.postfix}' not found. Resolved as "${cliTest.absPath +
          cliTest.postfix}".`
      )
    })
  })

  it('returns null and logs error when format of local config data is invalid', function () {
    const confArgv = ['aaa', '--conf', 'testdir/server.config.js']
    const wrongLocalConfigs = [null, () => {}, []]

    wrongLocalConfigs.forEach(wrongLocalConfig => {
      delete require.cache[serverConfigAbsPath]
      consoleErrStub.resetHistory()

      addFakeFilePaths(cliTest.absPath)
      basicRequireStub.withArgs('fs').returns(fakeFs)
      serverConfigRequireStub.resetBehavior()
      serverConfigRequireStub.returns(null)
      serverConfigRequireStub
        .withArgs(cliTest.absPath)
        .returns(wrongLocalConfig)
      process.argv = process.argv.concat(confArgv)

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.be.null()
      consoleErrStub.should.have.been.calledOnceWithExactly(
        'Error: The local server configuration data is not an object but: ',
        wrongLocalConfig
      )
    })
  })

  // it('returns null and logs error when rootDir or siteRootDir is invalid', function () {
  //   const confArgv = cliTest.correctConfArgv[0]
  //   const localConfig = [null, () => { }, []]

  //   consoleErrStub.resetHistory()
  //   delete require.cache[helpersBasicAbsPath]
  //   delete require.cache[serverConfigAbsPath]

  //   addFakeFilePaths(cliTest.absPath)
  //   basicRequireStub.withArgs('fs').returns(fakeFs)
  //   serverConfigRequireStub.resetBehavior()
  //   serverConfigRequireStub.returns(null)
  //   serverConfigRequireStub
  //     .withArgs(cliTest.absPath)
  //     .returns(localConfig)
  //   process.argv = process.argv.concat(confArgv)

  //   const returnedConfigData = require('../../../modules/config/server.config')
  //   expect(returnedConfigData).to.be.null()
  //   consoleErrStub.should.have.been.calledOnceWithExactly(
  //     'Error: The local server configuration data is not an object but: ',
  //     localConfig
  //   )
  // })
})
