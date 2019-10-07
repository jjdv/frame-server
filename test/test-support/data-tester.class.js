class DataTester {
  constructor (it, expect, getResult, checkResult, checkLogMatch, logStub) {
    this._it = it
    this._expect = expect
    this._getResult = getResult
    this._checkResult = checkResult
    this._checkLogMatch = checkLogMatch
    this._logStub = logStub
  }

  test (testData) {
    testData.forEach(td => {
      this._it(td.title, () => {
        if (Array.isArray(td.definition))
          td.definition.forEach(tdEl => {
            this._checkTestDataElement(tdEl, td)
          })
        else this._checkTestDataElement(td.definition, td)
      })
    })
  }

  _checkTestDataElement (tdEl, td) {
    let { result: referenceResult, logs } = tdEl
    if (!referenceResult) referenceResult = td.result
    if (!logs) logs = td.logs

    if (this._logStub) this._logStub.resetHistory()
    let actualResult = this._getResult(tdEl)
    this._checkResult(actualResult, referenceResult, this._expect)
    if (this._logStub) this._checkLogsMatch(logs, this._logStub, this._expect)
  }

  _checkLogsMatch (logs) {
    if (logs) {
      if (Array.isArray(logs)) {
        this._expect(logs.length).to.equal(this._logStub.args.length)
        logs.forEach((log, logIndx) =>
          this._checkLogMatch(log, this._logStub.getCall(logIndx))
        )
      } else {
        this._logStub.should.have.been.calledOnce()
        this._checkLogMatch(logs, this._logStub.getCall(0))
      }
    } else this._logStub.should.have.not.been.called()
  }
}

module.exports = DataTester

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function checkLogMatch (logs, logStub) {
  if (propDefined('args', logs)) {
    logStub.should.have.been.calledWithExactly(...logs.args)
  } else logStub.should.have.been.calledWithExactly(logs)
}

function propDefined (prop, obj) {
  return obj && typeof obj === 'object' && obj[prop]
}
