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
    client = new cassandra.Client({ contactPoints: config.cassandra.server_ips, keyspace: 'widgets' })

function createWidget (req, res) {
    var widget = req.body
    widget.id = req.param('id')
    widget.user_id = req.session.userid

    var upsertWidget = 'INSERT INTO userwidgets JSON ' + "'"+JSON.stringify(widget)+"';"
    client.execute(upsertWidget, function (error, result) {
        commonUtils.handleJSONResponse(null, res, {result: result, error: error})
    })
}

function getWidgets (req, res) {
    var getWidgetsByUser = 'SELECT * FROM widgets.userwidgets WHERE user_id = ? ALLOW FILTERING'
    var userId = req.session.userid
    client.execute(getWidgetsByUser, [userId], function (error, result) {
        commonUtils.handleJSONResponse(null, res, {result: result, error: error})
    })
}

function removeWidget (req, res) {
    var removeWidgetByUser = 'DELETE from widgets.userwidgets where user_id = ? AND id = ?'
    var widgetId = req.param('id')
    var userId = req.session.userid
    client.execute(removeWidgetByUser, [userId, widgetId], function (error, result) {
        commonUtils.handleJSONResponse(null, res, {result: result, error: error})
    })
}

exports.createWidget = createWidget
exports.getWidgets = getWidgets
exports.removeWidget = removeWidget
