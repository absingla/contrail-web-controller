/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/**
 * widget config view
 */
define(function (require) {
    var ContrailView = require('contrail-view')
    var Knockback = require('knockback')

    var WidgetLineChartConfigView = ContrailView.extend({
        events: {
            'click .update_widget': 'onChange'
        },

        initialize: function () {
            var self = this
            self.template = contrail.getTemplate4Id('chart-config-template')
            self.viewModel = Knockback.viewModel(self.model)
        },

        render: function () {
            var self = this

            var elementId = self.attributes.elementId
            self.$el.html(self.template(self.model.toJSON()))
            Knockback.applyBindings(self.viewModel, self.$el[0])
        },

        onChange: function () {
            this.trigger('change')
        }
    })
    return WidgetLineChartConfigView;
})
