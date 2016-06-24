/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var UDDashboardView = ContrailView.extend({
        el: $(contentContainer),
        className: 'widgets',

        initialize: function (p) {
            var self = this
        },

        renderNetworkingUDD: function (viewConfig) {
            var self = this

            self.renderView4Config(self.$el, null, self.getUDDViewConfig())
        },

        getUDDViewConfig: function () {
            return {
                view: "GridStackView",
                elementId: 'gridStackView',
                viewPathPrefix: "reports/udd/ui/js/views/",
                viewConfig: {
                    dataUrl: '/api/udd/widget/',
                }
            }
        },

        destroy: function () {
            var self = this
            self.childViewMap['gridStackView'].model.reset()
        }

    });

    return UDDashboardView;
});
