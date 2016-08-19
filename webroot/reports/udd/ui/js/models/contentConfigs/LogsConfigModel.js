/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContentConfigModel = require("reports/udd/ui/js/models/ContentConfigModel.js");

    return ContentConfigModel.extend({
        defaultConfig: {
            records: 5,
        },

        toJSON: function () {
            var self = this;
            return {
                records: self.records(),
            };
        },

        getContentViewOptions: function () {
            var self = this;
            return {
                totalRecords: self.records(),
            };
        },
    });
});
