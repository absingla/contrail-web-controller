/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineWithFocusChartView
 */
define(function (require) {
    var ContrailView = require('contrail-view')
    var ko = require('knockout')
    var Knockback = require('knockback')
    var kbValidation = require('validation')

    var LogsConfigView = ContrailView.extend({
        events: {
            'click .update-widget': 'onChange',
        },

        render: function () {
            var self = this

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), 'validation', null, null, function () {
                Knockback.applyBindings(self.model, self.$el[0])
                kbValidation.bind(self);
            })
        },

        getViewConfig: function () {
        },

        onChange: function () {
            var self = this
            if (self.model.model().isValid(true, 'validation')) {
                self.trigger('change')
            }
        },

        remove: function () {
            var self = this
            Knockback.release(self.model, self.$el[0])
            ko.cleanNode(self.$el[0])
            kbValidation.unbind(self)
            self.$el.empty().off() // off to unbind the events
            self.stopListening()
            return self
        },
    })
    return LogsConfigView;
})

