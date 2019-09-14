#!/usr/bin/env node
'use strict'

// Finds local server config and merges with default config data.
// If errors are found, they are reported and null is returned.

const getServerConfig = require('../modules/config/get-server-config')
const serverConfig = getServerConfig()
if (!serverConfig) process.exit()

// Validates each feature config data.
// If errors are found, they are reported and null is returned.

const getServerFeatures = require('../modules/features/get-server-features')
const serverFeatures = getServerFeatures(serverConfig)
if (!serverFeatures) process.exit()

// Gets the Express app and applies all got server features.

const app = require('express')()
serverFeatures.apply(app)

// Starts the server
const startServer = require('../modules/deployment/start-server')
startServer(app, serverConfig.port)
