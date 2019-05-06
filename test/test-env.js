'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)

const expect = chai.expect
const stub1 = sinon.stub()
const stub2 = sinon.stub()
const vars = [null, null]

module.exports = { expect, sinon, stub1, stub2, vars }
