/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var _ = require('underscore')
    var ContrailView = require('contrail-view')
    var StatQueryFormModel = require('reports/udd/ui/js/models/StatQueryFormModel')

    var WidgetContentView = ContrailView.extend({
        render: function () {
            var self = this;

            self.model = new StatQueryFormModel(self.attributes.viewConfig.query)
            self.renderView4Config(self.$(".front .panel-body"), self.model, self.getContentViewConfig());
            self.renderView4Config(self.$(".back .panel-body"), self.model, self.getConfigViewConfig(), null, null, null, function () {
                var widgetConfigView = self.childViewMap[self.attributes.viewConfig.widgetId]
                widgetConfigView.on('change', self.onConfigChange.bind(self))
            })
        },

        getContentViewConfig: function () {
            var self = this
            return $.extend(true, {}, self.attributes.viewConfig.contentViewConfig);
        },

        getConfigViewConfig: function () {
            var self = this
            return {
                view: "WidgetConfigView",
                elementId: self.attributes.viewConfig.widgetId,
                viewPathPrefix: "reports/udd/ui/js/views/",
            }
        },

        onConfigChange: function () {
            var self = this
            self.renderView4Config(self.$(".front .panel-body"), self.model, self.getContentViewConfig());
        }
    })

    return WidgetContentView;
});
