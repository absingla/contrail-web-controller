/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/**
 * widget container
 */
define(function (require) {
    var ContrailView = require('contrail-view')
    var Knockback = require('knockback')

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
            
            self.titleTemplate = contrail.getTemplate4Id('widget-title-edit-template')
        },

        render: function () {
            var self = this,
                element,
                model,
                config,
                onAllViewsRenderComplete;

            // render widget content (chart) on the front
            element = self.$(self.selectors.front)
            model = self.model
            config = self.getContentVC()
            self.renderView4Config(element, model, config)

            // render data source config (query) on the back
            config = self.getDataVC()
            element = self.$('#' + config.elementId)
            model = self.model.get('dataConfigModel')
            self.renderView4Config(element, model, config, null, null, null, self.subscribeConfigChange.bind(self, config.elementId))

            // render chart view config on the back
            config = self.getContentConfigVC()
            element = self.$('#' + config.elementId)
            model = self.model.get('contentConfigModel')
            self.renderView4Config(element, model, config, null, null, null, self.subscribeConfigChange.bind(self, config.elementId))

            config = self.getViewConfig()
            element = self.$('.data-source')
            model = self.model.get('viewsModel')
            self.renderView4Config(element, model, config, null, null, null, function () {
                Knockback.applyBindings(model, element[0])
            })
            return self
        },

        getViewConfig: function () {
            var self = this
            var dataConfigViewName = self.model.get('viewsModel').dataConfigView()
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'dataConfigView', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'Data Source',
                                        path: 'dataConfigView',
                                        dataBindValue: 'dataConfigView',
                                        class: 'span6',
                                        elementConfig: {
                                            dataTextField: 'text', dataValueField: 'id',
                                            data: self.model.getDataSourceList()
                                        }
                                    }
                                }, {
                                    elementId: 'contentView', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'Content View',
                                        path: 'contentView',
                                        dataBindValue: 'contentView',
                                        class: 'span6',
                                        elementConfig: {
                                            data: self.model.getContentViews4DataSource(dataConfigViewName)
                                        }
                                    }
                                }
                            ]
                    }
                    ]
                }
            }
        },

        getContentVC: function () {
            var self = this
            var contentConfig = self.model.get('contentConfig')
            var config = contentConfig['contentView']
            config.elementId = self.model.get('id') + 'Content'
            return config
        },

        getDataVC: function () {
            var self = this
            var contentConfig = self.model.get('contentConfig')
            var config = contentConfig['dataConfigView'];
            config.elementId = self.model.get('id') + 'DataConfig'
            return config
        },

        getContentConfigVC: function () {
            var self = this
            var contentConfig = self.model.get('contentConfig')
            var config = contentConfig['contentConfigView'];
            config.elementId = self.model.get('id') + 'ContentConfig'
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
            var title = self.model.get('config').title
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
            var configView = self.childViewMap[id]
            configView.on('change', self.onConfigChange.bind(self))
        },

        onConfigChange: function () {
            var self = this
            config = self.getContentVC()
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
