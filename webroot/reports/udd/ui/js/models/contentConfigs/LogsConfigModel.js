/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailModel = require('contrail-model')
    var cowc = require('core-constants')
    var cowf = new (require('core-formatters'))

    return ContrailModel.extend({
        defaultConfig: {
        },

        validations: {
            validation: {
            },
        },

        toJSON: function () {
            var self = this
            return {
            }
        },

        getParserOptions: function () {
            var self = this
            return {
            }
        },

        getContentViewOptions: function () {
            var self = this
            return {
            }
        },
    })
})
