/* eslint-env mocha */
'use strict'

// test environment
const { expect, sinon } = require('../../test-support/test-env')

// class under test
const Middleware = require('../../../modules/classes/middleware')

// test variables
const middlewareTestData = require('./test-support/test-data/middleware/middleware-test-data')
let consoleErrorStub, res, appSpy

// -----------------------------------------------------------------------
// test body
// -----------------------------------------------------------------------

describe('Middleware', function () {
  before(() => {
    consoleErrorStub = sinon.stub(console, 'error')
    appSpy = sinon.fake()
    appSpy.use = sinon.spy()
    appSpy.get = sinon.spy()
  })

  after(() => {
    consoleErrorStub.restore()
  })

  describe('creation', function () {
    testCreation()
  })

  describe('.apply()', () => {
    testApply()
  })
})

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function testCreation () {
  beforeEach(async () => {
    consoleErrorStub.resetHistory()
  })

  middlewareTestData.forEach(mtd => {
    it(mtd.title, () => {
      if (Array.isArray(mtd.definition)) {
        mtd.definition.forEach(mtdEl => {
          consoleErrorStub.resetHistory()
          checkMiddlewareFromDef(mtdEl, mtd)
        })
      } else checkMiddlewareFromDef(mtd.definition, mtd)
    })
  })
}

function testApply () {
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
    appSpy.use.should.have.been.calledOnce()
    expect(appSpy.use.getCall(0).args.length).to.equal(1)
    expect(appSpy.use.args[0][0].toString()).to.equal(
      (() => 'testResult').toString()
    )
  })

  it('invokes app[this.type](this.routePaths, this.middlewareFn) if this.routePaths exists', () => {
    const mdlw = new Middleware({
      name: 'testName',
      middleware: () => 'testResult',
      routePaths: '/api',
      type: 'get'
    })
    const consoleLogStub = sinon.stub(console, 'log')
    mdlw.apply(appSpy, false)
    consoleLogStub.restore()
    appSpy.get.should.have.callCount(1)
    expect(appSpy.get.getCall(0).args.length).to.equal(2)
    expect(appSpy.get.args[0][0]).to.equal('/api')
    expect(appSpy.get.args[0][1].toString()).to.equal(
      (() => 'testResult').toString()
    )
  })

  it('reports middleware use if invoked with 2nd argument true as .apply(app, true)', () => {
    const mdlw = new Middleware({
      name: 'testName',
      middleware: () => 'testResult'
    })
    const consoleLogStub = sinon.stub(console, 'log')
    mdlw.apply(appSpy, true)
    mdlw.apply(appSpy)
    consoleLogStub.should.have.been.calledTwice()
    consoleLogStub.should.always.have.been.calledWithExactly(
      "The middleware 'testName' has been applied."
    )
    consoleLogStub.restore()
    appSpy.use.should.have.been.calledTwice()
    expect(appSpy.use.getCall(1).args.length).to.equal(1)
    expect(appSpy.use.args[0][0].toString()).to.equal(
      (() => 'testResult').toString()
    )
    expect(appSpy.use.getCall(1).args.length).to.equal(1)
    expect(appSpy.use.args[1][0].toString()).to.equal(
      (() => 'testResult').toString()
    )
  })
}

function checkMiddlewareFromDef (mtdEl, mtd) {
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
function mComparable (m) {
  const mC = Object.assign({}, m)
  if (mC.middlewareFn) mC.middlewareFn = mC.middlewareFn.toString()
  return mC
}

function checkErrMessages (errMsgs) {
  if (Array.isArray(errMsgs)) {
    expect(errMsgs.length).to.equal(consoleErrorStub.args.length)
    errMsgs.forEach((errM, mIndx) =>
      checkErrMsg(errM, consoleErrorStub.getCall(mIndx))
    )
  } else checkErrMsg(errMsgs, consoleErrorStub.getCall(0))
}

function checkErrMsg (errMsg, errMsgStub) {
  if (argsDefined(errMsg)) {
    errMsgStub.should.have.been.calledWithExactly(...errMsg.args)
  } else errMsgStub.should.have.been.calledWithExactly(errMsg)
}

function argsDefined (val) {
  return val && typeof val === 'object' && val.args
}
