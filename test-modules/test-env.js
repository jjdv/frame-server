'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(dirtyChai)
chai.use(sinonChai)

module.exports = { expect, sinon }
