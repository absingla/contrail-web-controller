/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-model'
], function (_, QueryFormModel) {
    var FormSeriesQueryModel = QueryFormModel.extend({
        defaultConfig: qewmc.getQueryModel(qewc.FLOW_SERIES_TABLE, qewc.FS_QUERY_PREFIX),

        defaultSelectFields: ['flow_class_id', 'direction_ing'],

        validations: {}
    });

    return FormSeriesQueryModel;
});
