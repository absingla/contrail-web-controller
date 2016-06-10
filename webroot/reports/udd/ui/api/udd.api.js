/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

var uddapi = module.exports,
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    config = process.mainModule.exports["config"],
    qs = require('querystring'),
    _ = require('underscore');


function createWidget (req, res) {
    // TODO: Implement create new widget function
    commonUtils.handleJSONResponse(null, res, {});
}

exports.createWidget = createWidget;
