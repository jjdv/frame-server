/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const { expect, sinon } = require('../../test-env')

const { isEmpty } = require('../../../modules/helpers/basic')

// class under test
const Middleware = require('../../../modules/classes/middleware')

// test variables
const middlewareTestData = require('./test-support/middleware.test.data')
let consoleErrorStub, res

// --------------------------------------------------------
// ------------ test body -------------------------------
// --------------------------------------------------------

describe('Middleware', function() {
  // >>>>>>>> setup <<<<<<<<<
  before(() => {
    consoleErrorStub = sinon.stub(console, 'error')
  })

  beforeEach(async () => {
    consoleErrorStub.resetHistory()
  })

  after(() => {
    consoleErrorStub.restore()
  })
  // >>>>>> end of setup <<<<<<

  describe('.fromDef()', function() {
    middlewareTestData.forEach(mtd => {
      it(mtd.title, () => {
        if (Array.isArray(mtd.definition)) {
          mtd.definition.forEach(mDef => checkDefinitionResult(mDef, mtd))
        } else checkDefinitionResult(mtd.definition, mtd)
      })
    })
  })
})

// ---------------------------------------------------------------
// helpers
//

function checkDefinitionResult(mDef, mtd) {
  res = argsDefined(mDef)
    ? Middleware.fromDef(...mDef.args)
    : Middleware.fromDef(mDef)
  expect(res).to.deep.equal(mtd.result)
  if (isEmpty(res)) {
    if (Array.isArray(mtd.errMsg)) {
      mtd.errMsg.forEach((errMsg, mIndx) => {
        if (argsDefined(errMsg))
          expect(
            consoleErrorStub
              .getCall(mIndx)
              .calledOnceWithExactly(...errMsg.args)
          ).to.be.true()
        else expect(consoleErrorStub.calledOnceWithExactly(errMsg)).to.be.true()
      })
    } else {
      if (argsDefined(mtd.errMsg))
        expect(
          consoleErrorStub.calledWithExactly(...mtd.errMsg.args)
        ).to.be.true()
      else expect(consoleErrorStub.calledWithExactly(mtd.errMsg)).to.be.true()
    }
  }
}

function argsDefined(val) {
  return val && typeof val === 'object' && val.args
}
