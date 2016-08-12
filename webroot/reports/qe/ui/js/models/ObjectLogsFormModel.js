/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'knockout',
    'query-form-model',
    'core-basedir/js/common/qe.model.config',
    'core-constants',
], function (_, Knockout, QueryFormModel, qewmc, cowc) {
    var ObjectLogsFormModel = QueryFormModel.extend({

        defaultSelectFields: [],

        constructor: function (modelConfig, queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({
                table_type: cowc.QE_OBJECT_TABLE_TYPE,
                query_prefix: cowc.OBJECT_LOGS_PREFIX,
                limit: cowc.QE_DEFAULT_LIMIT_50K,
            })

            var modelData = _.merge(defaultConfig, modelConfig)
            _.merge({chunkSize: cowc.QE_RESULT_CHUNK_SIZE_10K}, queryReqConfig)
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig)

            return this;
        },

        isTableNameAvailable: function () {
            var tableName = this.table_name();
            return !(tableName === null || tableName === '');
        },
    })

    return ObjectLogsFormModel;
});
