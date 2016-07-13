/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var QueryFormModel = require('query-form-model')
    var cowc = require('core-constants')
    var qewmc = require('core-basedir/js/common/qe.model.config')

    var QueryConfigModel = QueryFormModel.extend({

        defaultSelectFields: [],

        constructor: function (modelConfig, queryReqConfig) {
            var self = this

            self.queryPrefixes = {}
            self.queryPrefixes[cowc.QE_OBJECT_TABLE_TYPE] = cowc.OBJECT_LOGS_PREFIX
            self.queryPrefixes[cowc.QE_LOG_TABLE_TYPE] = cowc.SYSTEM_LOGS_PREFIX
            self.queryPrefixes[cowc.QE_STAT_TABLE_TYPE] = cowc.STAT_QUERY_PREFIX

            var defaultConfig = qewmc.getQueryModelConfig({
                table_types: [
                    cowc.QE_LOG_TABLE_TYPE,
                    cowc.QE_OBJECT_TABLE_TYPE,
                    cowc.QE_STAT_TABLE_TYPE,
                ],
            })
            defaultConfig.table_type = cowc.QE_STAT_TABLE_TYPE
            defaultConfig.query_prefix = self.queryPrefixes[defaultConfig.table_type]

            var modelData = _.merge(defaultConfig, modelConfig)
            QueryFormModel.prototype.constructor.call(self, modelData, queryReqConfig)

            return this
        },
    })

    return QueryConfigModel
})
