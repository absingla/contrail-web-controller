/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var Backbone = require("backbone");
    var Widget = require("/reports/udd/ui/js/models/WidgetModel.js");

    var WidgetsCollection = Backbone.Collection.extend({

        initialize: function (attrs, options) {
            var self = this;
            self.model = Widget;
            self.url = options ? options.url : "";
        },

        parse: function (response) {
            return response && response.result ? response.result.rows : [];
        },

        filterBy: function (dashboardId, tabId) {
            var self = this;
            return new WidgetsCollection(self.filter(function (item) {
                var isValid = dashboardId ? item.get("dashboardId") === dashboardId : true;
                isValid = isValid && (tabId ? item.get("tabId") === tabId : true);
                return isValid;
            }), {url: self.url});
        },

        dashboardIds: function () {
            var self = this;
            return _.uniq(self.pluck("dashboardId"));
        },

        tabIds: function (dashboardId) {
            var self = this;
            return _.uniq(self.filterBy(dashboardId).pluck("tabId"));
        },

        setTabName: function (tabName) {
            var self = this;
            self.tabName = tabName;
            _.each(self.models, function (widget) {
                widget.set("tabName", tabName);
                widget.save();
            });
        },
        // each tab has its own collection
        getTabName: function () {
            var self = this;

            if (self.models[0]) {
                self.tabName = self.models[0].get("tabName") || self.models[0].get("tabId");
            }

            return self.tabName;
        },
    });
    return WidgetsCollection;
});
