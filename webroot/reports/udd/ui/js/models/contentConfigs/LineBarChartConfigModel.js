/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailModel = require('contrail-model')

    return ContrailModel.extend({
        defaultConfig: {
          "barColor": "1f77b4",
          "lineColor": "green",
          "barLabel": "",
          "barValue": "",
          "lineLabel": "",
          "lineValue": "",
          "yAxisValues": []
        },

        validations: {
        },

        toJSON: function () {
        }
    })
})
