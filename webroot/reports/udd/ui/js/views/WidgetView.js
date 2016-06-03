/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/**
 * widget container
 */
define(function (require) {
    var ContrailView = require('contrail-view')

    var WidgetView = ContrailView.extend({
        selectors: {
            front: '.front.panel-body',
            back: '.back.panel-body',
            heading: '.panel-heading',
            titleInput: '.panel-heading>input',
        },
        events: {
            'click .close': 'remove',
            'click .panel-heading .config': 'flipCard',
            'click .title': 'editTitle',
            'blur .panel-heading>input': 'onTitleChange',
            'click .save': 'saveConfig',
            'click .nav-pills': 'changeTab',
        },

        initialize: function (p) {
            var self = this
            self.dataConfigModel = self.model.get('dataConfigModel')
            self.contentConfigModel = self.model.get('contentConfigModel')
            self.titleTemplate = contrail.getTemplate4Id('widget-title-edit-template')
        },

        render: function () {
            var self = this,
                config;

            // render widget content (chart) on the front
            config = self.getWidgetContentVC()
            self.renderView4Config(self.$(self.selectors.front), self.model, config);

            // render data source config (query) on the back
            config = self.getWidgetDataVC()
            self.renderView4Config(self.$('#' + config.elementId), self.dataConfigModel, config, null, null, null, self.subscribeConfigChange.bind(self, config.elementId))

            // render chart view config
            config = self.getWidgetContentConfigVC()
            self.renderView4Config(self.$('#' + config.elementId), self.contentConfigModel, config, null, null, null, self.subscribeConfigChange.bind(self, config.elementId))
            return self
        },

        getWidgetContentVC: function () {
            var self = this
            var widgetContentConfig = self.model.get('widgetContentConfig')
            var config = widgetContentConfig['contentView']
            config.elementId = self.model.get('widgetId') + 'Content'
            return config
        },

        getWidgetDataVC: function () {
            var self = this
            var widgetContentConfig = self.model.get('widgetContentConfig')
            var config = widgetContentConfig['dataConfigView'];
            config.elementId = self.model.get('widgetId') + 'DataConfig'
            return config
        },

        getWidgetContentConfigVC: function () {
            var self = this
            var widgetContentConfig = self.model.get('widgetContentConfig')
            var config = widgetContentConfig['contentConfigView'];
            config.elementId = self.model.get('widgetId') + 'ChartConfig'
            return config
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
            self.$(self.selectors.front).toggle()
            self.$(self.selectors.back).toggle()
        },

        editTitle: function (e) {
            var self = this
            var title = self.model.get('widgetConfig').title
            self.$('.title').remove()
            self.$(self.selectors.heading).prepend(self.titleTemplate({title: title}))
            self.$(self.selectors.titleInput).focus()
            return true
        },

        onTitleChange: function (e) {
            var self = this
            var newTitle = self.$(self.selectors.titleInput).val()
            self.model.set('title', newTitle)
            self.$(self.selectors.titleInput).remove()
            self.$(self.selectors.heading).prepend(self.titleTemplate({title: newTitle}))
        },

        subscribeConfigChange: function (id) {
            var self = this
            // update widget content on it's config change
            var widgetQueryConfigView = self.childViewMap[id]
            widgetQueryConfigView.on('change', self.onConfigChange.bind(self))
        },
        onConfigChange: function () {
            var self = this
            config = self.getWidgetContentVC()
            self.renderView4Config(self.$(self.selectors.front), self.model, config);
            self.flipCard()
        },

        changeTab: function (e) {
            var self = this
            self.$('.tabs>div').hide()
            var id = self.$(e.target).data('id')
            self.$('#' + id).show()
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
