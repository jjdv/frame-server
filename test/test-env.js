'use strict'

const chai = require('chai')
const expect = chai.expect
const dirtyChai = require('dirty-chai')

const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(dirtyChai)
chai.use(sinonChai)
chai.should()

module.exports = { expect, sinon, StatusStub }
