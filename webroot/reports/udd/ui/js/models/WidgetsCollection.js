/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var Widget = require('/reports/udd/ui/js/models/WidgetModel.js')

    var WidgetsCollection = Backbone.Collection.extend({
        initialize: function (attrs, options) {
            options = options || {}
            this.model = Widget
            this.url = options.url
        },

        parse: function (response) {
            return  response && response.result ? response.result.rows : []
        },

        filterBy: function (dashboardId, tabId) {
            var self = this
            return new WidgetsCollection(self.filter(function (item) {
                var isValid = dashboardId ? item.get('dashboardId') === dashboardId : true
                isValid = isValid && (tabId ? item.get('tabId') === tabId : true)
                return isValid
            }), {url: this.url})
        },

        dashboardIds: function () {
            return _.uniq(this.pluck('dashboardId'))
        },

        tabIds: function () {
            return _.uniq(this.pluck('tabId'))
        },
    })
    return WidgetsCollection
})
