/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "knockout",
    "query-form-model",
    "core-basedir/js/common/qe.model.config",
    "core-constants",
], function (_, Knockout, QueryFormModel, qewmc, cowc) {
    var SystemLogsFormModel = QueryFormModel.extend({

        defaultSelectFields: ["Type"],

        disableSelectFields: ["SequenceNum", "Context", "Keyword"],

        disableWhereFields: ["Level", "Keyword"],

        constructor: function (modelConfig, _queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({
                table_name: cowc.MESSAGE_TABLE,
                table_type: cowc.QE_LOG_TABLE_TYPE,
                query_prefix: cowc.SYSTEM_LOGS_PREFIX,
                keywords: "",
                log_level: "7",
                limit: cowc.QE_DEFAULT_LIMIT_50K,
                select: cowc.DEFAULT_SL_SELECT_FIELDS,
            });
            var queryReqConfig = {chunkSize: cowc.QE_RESULT_CHUNK_SIZE_10K};

            var modelData = _.merge(defaultConfig, modelConfig);
            _.merge(queryReqConfig, _queryReqConfig);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        },
    });

    return SystemLogsFormModel;
});
