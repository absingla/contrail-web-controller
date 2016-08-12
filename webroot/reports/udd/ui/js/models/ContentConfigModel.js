/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailModel = require('contrail-model')

    return ContrailModel.extend({
        onDataModelChange: function (viewModel) {
        },

        toJSON: function () {
            return {}
        },

        getParserOptions: function () {
            return {}
        },

        getContentViewOptions: function () {
            return {}
        },
    })
})
