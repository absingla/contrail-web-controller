/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailModel = require('contrail-model')

    return ContrailModel.extend({
        defaultConfig: {
          "color": "1f77b4",
          "yAxisLabel": "",
          "yAxisValue": "",
          "yAxisValues": []
        },

        validations: {
        },

        toJSON: function () {
        }
    })
})
