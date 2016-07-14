/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var qewmc = require('core-basedir/js/common/qe.model.config')
    var cowc = require('core-constants')
    var QueryFormModel = require('query-form-model')

    var QueryConfigModel = QueryFormModel.extend({

        defaultSelectFields: [],

        constructor: function (modelConfig, queryReqConfig) {
            var self = this

            var defaultOptions = {}
            defaultOptions[cowc.QE_LOG_TABLE_TYPE] = {
                query_prefix: cowc.SYSTEM_LOGS_PREFIX,
                table_name: cowc.MESSAGE_TABLE,
                select: cowc.DEFAULT_SL_SELECT_FIELDS,
                log_level: '7',
                keywords: '',
                limit: cowc.QE_DEFAULT_LIMIT_50K,
            }
            defaultOptions[cowc.QE_STAT_TABLE_TYPE] = {
                query_prefix: cowc.STAT_QUERY_PREFIX,
            }

            var defaultConfig = qewmc.getQueryModelConfig({
                keywords: '',
                log_level: '',
                limit: '',
            })

            var modelData = _.merge(defaultConfig, modelConfig)
            QueryFormModel.prototype.constructor.call(self, modelData, queryReqConfig)
            self.model().on('change:table_type', function (model, table_type) {
                model.set(defaultOptions[table_type])
                // TODO select values are not set on first call
                model.set(defaultOptions[table_type])
            })

            return self
        },
    })

    return QueryConfigModel
})
