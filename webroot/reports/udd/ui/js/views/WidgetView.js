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
            self.dataModel = self.model.get('dataModel')
            self.chartModel = self.model.get('chartModel')
            self.titleTemplate = contrail.getTemplate4Id('widget-title-edit-template')
        },

        render: function () {
            var self = this,
                config;

            // render widget content (chart) on the front
            config = self.getWidgetContentConfig()
            self.renderView4Config(self.$(self.selectors.front), self.model, config);

            // render data source config (query) on the back
            config = self.getWidgetQueryConfig()
            self.renderView4Config(self.$('#' + config.elementId), self.dataModel, config, null, null, null, self.subscribeConfigChange.bind(self, config.elementId))

            // render chart view config
            config = self.getWidgetChartConfig()
            self.renderView4Config(self.$('#' + config.elementId), self.chartModel, config, null, null, null, self.subscribeConfigChange.bind(self, config.elementId))
            return self
        },

        getWidgetContentConfig: function () {
            var self = this
            var config = self.model.get('widgetContentConfig');
            config.elementId = self.model.get('widgetId') + 'Content'
            return config
        },

        getWidgetQueryConfig: function () {
            var self = this
            var config = self.model.get('dataConfig');
            config.elementId = self.model.get('widgetId') + 'DataConfig'
            return config
        },

        getWidgetChartConfig: function () {
            var self = this
            var contentConfig = self.model.get('widgetContentConfig');
            return {
                view: contentConfig.configView,
                viewPathPrefix: contentConfig.viewPathPrefix,
                elementId: self.model.get('widgetId') + 'ChartConfig',
            }
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
            config = self.getWidgetContentConfig()
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
