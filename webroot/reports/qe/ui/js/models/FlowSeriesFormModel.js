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
    var FlowSeriesFormModel = QueryFormModel.extend({

        defaultSelectFields: ['flow_class_id', 'direction_ing'],

        constructor: function (modelConfig, queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({
                table_name: cowc.FLOW_SERIES_TABLE,
                table_type: cowc.QE_FLOW_TABLE_TYPE,
                query_prefix: cowc.FS_QUERY_PREFIX,
                select: cowc.DEFAULT_FS_SELECT_FIELDS,
            })

            var modelData = _.merge(defaultConfig, modelConfig)
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        },
    });

    return FlowSeriesFormModel;
});
