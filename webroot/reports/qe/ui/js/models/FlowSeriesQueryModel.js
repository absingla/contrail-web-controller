/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-model'
], function (_, QueryFormModel) {
    var FormSeriesQueryModel = QueryFormModel.extend({
        defaultConfig: qewmc.getQueryModel("FlowSeriesTable", "fs"),

        validations: {}
    });

    return FormSeriesQueryModel;
});
