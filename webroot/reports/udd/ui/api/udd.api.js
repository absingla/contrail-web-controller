/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

var commonUtils = require(process.mainModule.exports.corePath + '/src/serverroot/utils/common.utils')
var config = process.mainModule.exports.config

var cassandra = require('cassandra-driver')
var client = new cassandra.Client({ contactPoints: config.cassandra.server_ips, keyspace: 'config_webui' })

function createWidget (req, res) {
    var widget = req.body
    widget.id = req.param('id')
    widget['"userId"'] = req.session.userid

    var upsertWidget = 'INSERT INTO user_widgets JSON ' + "'" + JSON.stringify(widget) + "';"
    client.execute(upsertWidget, function (error, result) {
        commonUtils.handleJSONResponse(null, res, {result: result, error: error})
    })
}

function getWidgets (req, res) {
    var getWidgetsByUser = 'SELECT * FROM user_widgets WHERE "userId" = ?'
    var userId = req.session.userid
    client.execute(getWidgetsByUser, [userId], function (error, result) {
        commonUtils.handleJSONResponse(null, res, {result: result, error: error})
    })
}

function removeWidget (req, res) {
    var removeWidgetByUser = 'DELETE from user_widgets where id = ?'
    var widgetId = req.param('id')
    // var userId = req.session.userid
    client.execute(removeWidgetByUser, [widgetId], function (error, result) {
        commonUtils.handleJSONResponse(null, res, {result: result, error: error})
    })
}

exports.createWidget = createWidget
exports.getWidgets = getWidgets
exports.removeWidget = removeWidget
