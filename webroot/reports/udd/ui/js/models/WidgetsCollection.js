/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var Widget = require('/reports/udd/ui/js/models/WidgetModel.js')

    var WidgetsCollection = Backbone.Collection.extend({
        initialize: function (options) {
            this.model = Widget
        },

        parse: function (response) {
            return  response && response.result ? response.result.rows : []
        }
    })
    return WidgetsCollection
})
