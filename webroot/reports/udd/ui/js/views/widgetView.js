/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var ContrailView = require('contrail-view')

    return ContrailView.extend({
        className: 'widget',
        events: {
            'click .close': 'remove',
            'click .panel-heading .config': 'flipCard',
            'click .title': 'onTitleClick',
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
            self.renderView4Config(self.$el, self.model, {
                view: "WidgetContentView",
                viewPathPrefix: "reports/udd/ui/js/views/",
                viewConfig: {}
            });
            return self
        },

        remove: function () {
            var self = this
            self.model.destroy()
        },

        flipCard: function () {
            var self = this
            self.$('.front').toggle()
            self.$('.back').toggle()
        },

        onTitleClick: function (e) {
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

        updateSaveBtn: function () {
            var self = this
            self.$('.save').toggleClass('disabled', !self.model.provider.isDirty())
        },

        saveConfig: function () {
            var self = this
            self.chart.model.save()
        }
    })
})
