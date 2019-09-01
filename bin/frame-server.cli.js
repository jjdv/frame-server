#!/usr/bin/env node
'use strict'

// Finds local server config and merges with default config data.
// If errors are found, they are reported and null is returned.
// Exists if errors.

const serverConfig = require('../config/server.config')
if (!serverConfig) process.exit()

// Validates each feature config data and gets server features.
// If errors are found, they are reported and null is returned.
// Exists if errors.

const validateAndGetServerFeatures = require('../modules/server-features')
const serverFeatures = validateAndGetServerFeatures(serverConfig)
if (!serverFeatures) process.exit()

// Gets the Express app and applies all got server features.

const app = require('express')()
serverFeatures.apply(app)

// Starts the server
const startServer = require('../modules/deployment/start-server')
startServer(app, serverConfig.port)
