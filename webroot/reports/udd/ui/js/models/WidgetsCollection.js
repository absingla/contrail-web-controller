/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var Widget = require('/reports/udd/ui/js/models/WidgetModel.js')

    var WidgetsCollection = Backbone.Collection.extend({

        initialize: function (attrs, options) {
            var self = this
            options = options || {}
            self.model = Widget
            self.url = options.url
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
            }), {url: self.url})
        },

        dashboardIds: function () {
            var self = this
            return _.uniq(self.pluck('dashboardId'))
        },

        tabIds: function (dashboardId) {
            var self = this
            return _.uniq(self.filterBy(dashboardId).pluck('tabId'))
        },
    })
    return WidgetsCollection
})
