/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailModel = require('contrail-model')
    var cowc = require('core-constants')
    var cowf = new (require('core-formatters'))

    return ContrailModel.extend({
        defaultConfig: {
            'records': 5,
        },

        toJSON: function () {
            var self = this
            return {
                'records': self.records(),
            }
        },

        getContentViewOptions: function () {
            var self = this
            return {
            }
        },
    })
})
