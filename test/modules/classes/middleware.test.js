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
let consoleErrorStub, res

// --------------------------------------------------------
// ------------ test body -------------------------------
// --------------------------------------------------------

describe('Middleware', function() {
  before(() => {
    consoleErrorStub = sinon.stub(console, 'error')
  })

  beforeEach(async () => {
    consoleErrorStub.resetHistory()
  })

  after(() => {
    consoleErrorStub.restore()
  })

  describe('.fromDef()', function() {
    middlewareTestData.forEach(mtd => {
      it(mtd.title, () => {
        if (Array.isArray(mtd.definition)) {
          mtd.definition.forEach((mDef, index) => {
            consoleErrorStub.resetHistory()
            // const result = arrElOrArgFn(mtd.result)
            // const errMsg = arrElOrArgFn(mtd.errMsg)
            // checkDefinitionResult(mDef, result(index), errMsg(index))
            checkDefinitionResult(mDef, mtd.result, mtd.errMsg)
          })
        } else checkDefinitionResult(mtd.definition, mtd.result, mtd.errMsg)
      })
    })
  })
})

// ---------------------------------------------------------------
// helpers
// ---------------------------------------------------------------

function checkDefinitionResult(mDef, result, errMsg) {
  let options
  if (mDef) {
    if (typeof mDef === 'object') {
      options = mDef.options
      if (mDef.result) result = mDef.result
      if (mDef.errMsg) errMsg = mDef.errMsg
    }
    mDef = cleanMDef(mDef)
  }

  res = new Middleware(mDef, options)
  expect(res.apply).to.exist()
  expect(mComparable(res)).to.deep.equal(mComparable(result))
  if (!res.middlewareFn) {
    checkErrMessages(errMsg)
  }
}

function cleanMDef(mDef) {
  const validMDefProps = ['name', 'type', 'routePaths', 'middleware']
  const mDefInt = Object.assign({}, mDef)
  for (const prop in mDefInt) {
    if (!validMDefProps.includes(prop)) delete mDefInt[prop]
  }
  return mDefInt
}

// middleware comparable
function mComparable(m) {
  const mC = Object.assign({}, m)
  if (m.middlewareFn) mC.middlewareFn = mC.middlewareFn.toString()
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
  } else expect(errMsgStub[stubMethod](errMsg)).to.be.true()
}

function argsDefined(val) {
  return val && typeof val === 'object' && val.args
}

function arrElOrArgFn(arg) {
  return Array.isArray(arg) ? indx => arg[indx] : () => arg
}
