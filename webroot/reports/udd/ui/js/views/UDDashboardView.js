/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var UDDashboardView = ContrailView.extend({
        el: $(contentContainer),

        initialize: function (p) {
            var self = this

            Handlebars.registerHelper('select', function (value, options) {
                var $el = $('<select />').html(options.fn(self))
                $el.find('[value="' + value + '"]').attr({'selected': 'selected'})
                return $el.html()
            })
        },

        renderNetworkingUDD: function (viewConfig) {
            var self = this

            self.renderView4Config(self.$el, null, self.getUDDViewConfig())
        },

        getUDDViewConfig: function () {
            return {
                view: "GridStackView",
                viewPathPrefix: "reports/udd/ui/js/views/",
                viewConfig: {
                    dataUrl: '/reports/udd/data/networking-udd.json'
                }
            }
        }

    });

    return UDDashboardView;
});
