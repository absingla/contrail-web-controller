/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

var uddapi = module.exports,
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    config = process.mainModule.exports["config"],
    qs = require('querystring'),
    _ = require('lodash')

var cassandra = require('cassandra-driver'),
    client = new cassandra.Client({ contactPoints: config.cassandra.server_ips });

function createWidget (req, res) {
    req.param('id')
    console.log(req.body)
    commonUtils.handleJSONResponse(null, res, {})
}

function getWidgets (req, res) {
    commonUtils.handleJSONResponse(null, res, {})
}

exports.createWidget = createWidget
exports.getWidgets = getWidgets
