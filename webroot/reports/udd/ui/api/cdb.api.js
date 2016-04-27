/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

var cdbapi = module.exports,
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    config = process.mainModule.exports["config"],
    qs = require('querystring'),
    _ = require('underscore');

var cassandra = require('cassandra-driver'),
    client = new cassandra.Client({ contactPoints: config.cassandra.server_ips });

function runQuery(req, res) {
    // TODO: Implement query to fetch udd config data from cassandra
    commonUtils.handleJSONResponse(null, res, {});
}

exports.runQuery = runQuery;