/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "query-form-model",
    "core-basedir/reports/qe/ui/js/common/qe.model.config",
    "core-constants"
], function (_, QueryFormModel, qeModelConfig, coreConstants) {
    var FlowRecordFormModel = QueryFormModel.extend({

        defaultSelectFields: ["direction_ing"],

        constructor: function (modelConfig, queryReqConfig) {
            var defaultConfig = qeModelConfig.getQueryModelConfig(coreConstants.QE_FR_DEFAULT_MODEL_CONFIG);

            var modelData = _.merge(defaultConfig, modelConfig);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        },
    });

    return FlowRecordFormModel;
});
