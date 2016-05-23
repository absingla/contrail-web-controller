/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var ContrailView = require('contrail-view')

    var WidgetView = ContrailView.extend({
        className: 'widget',
        events: {
            'click .close': 'remove',
            'click .panel-heading .config': 'flipCard',
            'click .title': 'editTitle',
            'blur .panel-heading>input': 'onTitleChange',
            'click .save': 'saveConfig',
        },

        initialize: function (p) {
            var self = this
            //self.model.provider.fetch()
            //self.listenTo(self.model.provider, 'change', self.updateSaveBtn)
        },

        render: function () {
            var self = this
            self.renderView4Config(self.$el, null, {
                view: "WidgetContentView",
                elementId: 'widgetContentView',
                viewPathPrefix: "reports/udd/ui/js/views/",
                viewConfig: self.model.attributes
            }, null, null, null, function () {
                var widgetConfigView = self.childViewMap.widgetContentView.childViewMap[self.model.get('widgetId')]
                widgetConfigView.on('change', self.onConfigChange.bind(self))
            });
            return self
        },

        remove: function () {
            var self = this
            self.model.destroy()
        },

        /*
         * toggle between chart and config view
         */
        flipCard: function () {
            var self = this
            self.$('.front').toggle()
            self.$('.back').toggle()
        },

        editTitle: function (e) {
            var self = this
            var title = self.model.get('title')
            self.$('.title').remove()
            self.$('.panel-heading').prepend($('<input type="text" value="${ title }"/>'))
            self.$('.panel-heading>input').focus()
            return true
        },

        onTitleChange: function (e) {
            var self = this
            var newTitle = self.$('.panel-heading>input').val()
            self.model.set('title', newTitle)
            self.$('.panel-heading>input').remove()
            self.$('.panel-heading').prepend('<span class="title">${ newTitle }</span>')
        },

        onConfigChange: function () {
            var self = this
            self.flipCard()
        },

        //TODO move to WidgetConfigView
        updateSaveBtn: function () {
            var self = this
            self.$('.save').toggleClass('disabled', !self.model.provider.isDirty())
        },

        saveConfig: function () {
            var self = this
            self.chart.model.save()
        }
    })
    return WidgetView;
})
