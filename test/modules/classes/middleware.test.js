/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const { expect, sinon } = require('../../test-env')

const { isEmpty } = require('../../../modules/helpers/basic')

// class under test
const Middleware = require('../../../modules/classes/middleware')

// test variables
const middlewareTestData = require('./test-support/middleware-test-data')
let consoleErrorStub, res, appSpy

// -----------------------------------------------------------------------
// test body
// -----------------------------------------------------------------------

describe('Middleware', function() {
  before(() => {
    consoleErrorStub = sinon.stub(console, 'error')
    appSpy = { use: sinon.spy() }
  })

  after(() => {
    consoleErrorStub.restore()
  })

  describe('creation', function() {
    testCreation()
  })

  describe('.apply()', () => {
    testApply()
  })
})

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function testCreation() {
  beforeEach(async () => {
    consoleErrorStub.resetHistory()
  })

  middlewareTestData.forEach(mtd => {
    it(mtd.title, () => {
      if (Array.isArray(mtd.definition)) {
        mtd.definition.forEach((mtdEl, index) => {
          consoleErrorStub.resetHistory()
          checkDefinitionResult(mtdEl, mtd)
        })
      } else checkDefinitionResult(mtd.definition, mtd)
    })
  })
}

function testApply() {
  beforeEach(async () => {
    appSpy.use.resetHistory()
  })

  it('does not call app if the middlewareFn is falsy', () => {
    const mdlw = new Middleware({
      name: 'testName',
      middleware: null
    })
    mdlw.apply(appSpy, false)
    appSpy.use.should.have.not.been.called()
  })

  it('invokes app[this.type](this.middlewareFn) if this.routePaths does not exist', () => {
    const mdlw = new Middleware({
      name: 'testName',
      middleware: () => 'testResult'
    })
    mdlw.apply(appSpy, false)
    appSpy.use.calledOnceWithExactly(() => 'testResult')
  })

  it('invokes app[this.type](this.routePaths, this.middlewareFn) if this.routePaths exists', () => {
    const mdlw = new Middleware({
      name: 'testName',
      middleware: () => 'testResult',
      routePaths: '/api'
    })
    const consoleLogStub = sinon.stub(console, 'log')
    mdlw.apply(appSpy, false)
    consoleLogStub.restore()
    appSpy.use.calledOnceWithExactly('/api', () => 'testResult')
  })

  it('reports middleware use if invoked with 2nd argument true as .apply(app, true)', () => {
    const mdlw = new Middleware({
      name: 'testName',
      middleware: () => 'testResult'
    })
    const consoleLogStub = sinon.stub(console, 'log')
    mdlw.apply(appSpy, true)
    mdlw.apply(appSpy)
    consoleLogStub.calledTwice
    consoleLogStub.alwaysCalledWithExactly(
      "The middleware 'testName' has been applied."
    )
    consoleLogStub.restore()
    appSpy.use.calledTwice
    appSpy.use.alwaysCalledWithExactly('/api', () => 'testResult')
  })
}

function checkDefinitionResult(mtdEl, mtd) {
  let definition, options, result, errMsg
  if (
    mtdEl &&
    mtdEl.constructor === Object &&
    Object.keys(mtdEl).includes('definition')
  ) {
    ;({ definition, options, result, errMsg } = mtdEl)
    if (!result) result = mtd.result
    if (!errMsg) errMsg = mtd.errMsg
  } else {
    definition = mtdEl
    result = mtd.result
    errMsg = mtd.errMsg
  }

  res = new Middleware(definition, options)
  expect(res.apply).to.exist()
  expect(mComparable(res)).to.deep.equal(mComparable(result))
  if (!res.middlewareFn) {
    checkErrMessages(errMsg)
  }
}

// middleware comparable
function mComparable(m) {
  const mC = Object.assign({}, m)
  if (mC.middlewareFn) mC.middlewareFn = mC.middlewareFn.toString()
  return mC
}

function checkErrMessages(errMsgs) {
  if (Array.isArray(errMsgs))
    errMsgs.forEach((errM, mIndx) =>
      checkErrMsg(errM, consoleErrorStub.getCall(mIndx), false)
    )
  else checkErrMsg(errMsgs, consoleErrorStub)
}

function checkErrMsg(errMsg, errMsgStub, once = true) {
  const stubMethod = once ? 'calledOnceWithExactly' : 'calledWithExactly'
  if (argsDefined(errMsg)) {
    if (!once) {
      expect(errMsgStub.args).to.deep.equal(errMsg.args)
      expect(errMsgStub[stubMethod](...errMsg.args)).to.be.true()
    } else expect(errMsgStub[stubMethod](...errMsg.args)).to.be.true()
  } else {
    expect(errMsgStub[stubMethod](errMsg)).to.be.true()
  }
}

function argsDefined(val) {
  return val && typeof val === 'object' && val.args
}

function arrElOrArgFn(arg) {
  return Array.isArray(arg) ? indx => arg[indx] : () => arg
}
