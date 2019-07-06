'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)

const expect = chai.expect

module.exports = { expect, sinon }
