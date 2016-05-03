/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
       'underscore',
       'contrail-view',
       '/reports/udd/ui/js/views/layoutView.js'
], function (_, ContrailView, Layout) {
    var UDDashboardView = ContrailView.extend({
        el: $(contentContainer),

        initialize: function (p) {
            var self = this
            self.layout = new Layout({model: p.userWidgets})

            Handlebars.registerHelper('select', function( value, options ){
                var $el = $('<select />').html( options.fn(self) )
                $el.find('[value="' + value + '"]').attr({'selected':'selected'})
                return $el.html()
            })
        },

        renderNetworkingUDD: function (viewConfig) {
            var self = this
            self.$el.prepend(self.layout.render().el)
            self.layout.initLayout()
            self.layout.model.fetch()
        }
    });

    return UDDashboardView;
});
