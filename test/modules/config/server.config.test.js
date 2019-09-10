/* eslint-env mocha */

const path = require('path')

// test environment
const { expect, sinon } = require('../../test-env')
const FakeFs = require('../../../modules/helpers/fake-fs')
const {
  lookupConfigPaths,
  cliTest,
  correctLocalConfigData,
  incorrectLocalConfigData
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
  delete require.cache[serverConfigAbsPath]
  delete require.cache[helpersBasicAbsPath]
  delete require.cache[errorReportersAbsPath]
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

  it('finds local config in any default directory', function () {
    const localConfig = correctLocalConfigData[0]
    const expectedConfigData = { ...configIni, ...localConfig }
    const siteRootDirAbsPath = path.resolve(
      expectedConfigData.rootDir,
      expectedConfigData.siteRootDir
    )
    const fakeFs = new FakeFs()
    fakeFs.addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
    basicRequireStub.withArgs('fs').returns(fakeFs)

    lookupConfigPaths.forEach(configPath => {
      fakeFs.resetFakeFilePaths()
      fakeFs.addFakeFilePaths(configPath)
      serverConfigRequireStub.resetBehavior()
      serverConfigRequireStub.returns(null)
      serverConfigRequireStub.withArgs(configPath).returns(localConfig)
      delete require.cache[serverConfigAbsPath]

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.deep.equal(expectedConfigData)
    })
  })

  it('finds local config specified in cli', function () {
    const localConfig = correctLocalConfigData[0]
    const expectedConfigData = { ...configIni, ...localConfig }
    const siteRootDirAbsPath = path.resolve(
      expectedConfigData.rootDir,
      expectedConfigData.siteRootDir
    )
    const fakeFs = new FakeFs()
    fakeFs.addFakeFilePaths(cliTest.absPath)
    fakeFs.addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
    basicRequireStub.withArgs('fs').returns(fakeFs)
    serverConfigRequireStub.withArgs(cliTest.absPath).returns(localConfig)

    cliTest.correctConfArgv.forEach(confArgv => {
      process.argv = argvOriginal.slice(0, 2).concat(confArgv)
      delete require.cache[serverConfigAbsPath]

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.deep.equal(expectedConfigData)
    })
  })

  it('correctly merges ini and local configs', function () {
    const fakeFs = new FakeFs()
    fakeFs.addFakeFilePaths(cliTest.absPath)
    basicRequireStub.withArgs('fs').returns(fakeFs)

    let confIndex
    cliTest.correctConfArgv.forEach((confArgv, index) => {
      process.argv = argvOriginal.slice(0, 2).concat(confArgv)
      confIndex = index % 2
      const localConfig = correctLocalConfigData[confIndex]
      const expectedConfigData = { ...configIni, ...localConfig }

      const siteRootDirAbsPath = path.resolve(
        expectedConfigData.rootDir,
        expectedConfigData.siteRootDir
      )
      fakeFs.addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
      serverConfigRequireStub.resetBehavior()
      serverConfigRequireStub.returns(null)
      serverConfigRequireStub.withArgs(cliTest.absPath).returns(localConfig)
      delete require.cache[serverConfigAbsPath]

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.deep.equal(expectedConfigData)
    })
  })

  it('returns null and logs error when non-existing config specified in cli', function () {
    cliTest.incorrectConfArgv.forEach(confArgv => {
      delete require.cache[serverConfigAbsPath]
      consoleErrStub.resetHistory()
      process.argv = argvOriginal.slice(0, 2).concat(confArgv)

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.be.null()
      consoleErrStub.should.have.been.calledOnceWithExactly(
        `Error: Server config file '${cliTest.cliConfigFile +
          cliTest.postfix}' not found. Resolved as "${cliTest.absPath +
          cliTest.postfix}".`
      )
    })
  })

  it('returns null and logs error when the format of local config data is invalid', function () {
    const confArgv = ['aaa', '--conf', 'testdir/server.config.js']
    process.argv = process.argv.concat(confArgv)
    const fakeFs = new FakeFs()
    fakeFs.addFakeFilePaths(cliTest.absPath)
    basicRequireStub.withArgs('fs').returns(fakeFs)
    const wrongLocalConfigs = [null, () => {}, []]

    wrongLocalConfigs.forEach(wrongLocalConfig => {
      delete require.cache[serverConfigAbsPath]
      consoleErrStub.resetHistory()

      serverConfigRequireStub.resetBehavior()
      serverConfigRequireStub.returns(null)
      serverConfigRequireStub
        .withArgs(cliTest.absPath)
        .returns(wrongLocalConfig)

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.be.null()
      consoleErrStub.should.have.been.calledOnceWithExactly(
        'Error: The local server configuration data is not an object but: ',
        wrongLocalConfig
      )
    })
  })

  it('returns null and logs error when rootDir, siteRootDir or port is invalid', function () {
    const confArgv = cliTest.correctConfArgv[0]
    process.argv = process.argv.concat(confArgv)
    const rootDir = configIni.rootDir
    const siteRootDir = path.resolve(configIni.rootDir, configIni.siteRootDir)
    const fakeFs = new FakeFs()
    fakeFs.addFakeFilePaths(cliTest.absPath)
    fakeFs.addFakeDirPaths([rootDir, siteRootDir])
    basicRequireStub.withArgs('fs').returns(fakeFs)

    incorrectLocalConfigData.forEach(incorrectLCofData => {
      delete require.cache[serverConfigAbsPath]
      consoleErrStub.resetHistory()
      serverConfigRequireStub.resetBehavior()
      serverConfigRequireStub.returns(null)

      serverConfigRequireStub
        .withArgs(cliTest.absPath)
        .returns(incorrectLCofData.conf)

      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.be.null()
      consoleErrStub.should.have.been.calledOnceWithExactly(
        ...incorrectLCofData.errArgs
      )
    })
  })
})
