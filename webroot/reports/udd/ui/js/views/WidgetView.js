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
            title: '.panel-heading>.title',
            titleInput: '.panel-heading>input',
            configTabs: '.tabs>div',
        },

        events: {
            'click .close': 'remove',
            'click .panel-heading .config': 'flipCard',
            'click .title': 'editTitle',
            'blur .panel-heading>input': 'saveTitle',
            'click .save': 'saveConfig',
            'click .nav-pills': 'changeConfigTab',
        },

        initialize: function () {
            var self = this
            // rerender on contentView change
            self.listenTo(self.model, 'change:dataConfigModel', self.renderDataConfigView.bind(self))
            self.listenTo(self.model, 'change:contentConfigModel', self.renderContentConfigView.bind(self))
        },

        render: function () {
            var self = this
            var element
            var model
            var config

            Knockback.applyBindings(self.model.get('configModel'), self.$el.find(self.selectors.heading)[0])
            // show config by default for widget with no data source selected
            if (!self.model.isValid()) self.flipCard()

            // first render is executed after self.model 'change' event is triggered
            self.renderDataConfigView()
            self.renderContentConfigView()

            config = self.getViewConfig()
            element = self.$('.data-source')
            model = self.model.get('viewsModel')
            self.renderView4Config(element, model, config, null, null, null, function () {
                Knockback.applyBindings(model, element[0])
            })
            return self
        },
        // render data source config (query) on the back
        renderDataConfigView: function () {
            var self = this
            var config = self.model.getViewConfig('dataConfigView')
            var element = self.$('#' + config.elementId)
            var model = self.model.get('dataConfigModel')
            self.renderView4Config(element, model, config, null, null, null, function () {
                self.subscribeConfigChange(config.elementId)
            })
        },
        // render widget content (chart) on the front
        renderContentView: function () {
            var self = this
            var parserOptions = self.model.get('contentConfigModel').getParserOptions()
            var dataConfigModel = self.model.get('dataConfigModel')
            var model = dataConfigModel.getDataModel(parserOptions)
            var config = self.model.getViewConfig('contentView')
            var element = self.$('#' + config.elementId)
            self.renderView4Config(element, model, config)
        },
        // render content config view on the back
        renderContentConfigView: function () {
            var self = this
            var config = self.model.getViewConfig('contentConfigView')
            var element = self.$('#' + config.elementId)
            var model = self.model.get('contentConfigModel')
            var oldView = self.childViewMap[config.elementId]
            if (oldView) oldView.remove()
            self.renderView4Config(element, model, config, null, null, null, function () {
                self.subscribeConfigChange(config.elementId)

                // render Content View only after Content Config view
                if (self.model.isValid()) self.renderContentView()
            })
        },

        getViewConfig: function () {
            var self = this
            var dataConfigViewId = self.model.get('viewsModel').dataConfigView()
            return {
                view: 'SectionView',
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
                                            data: self._getViewOptionsList(self.model.getDataSourceList()),
                                        },
                                    },
                                }, {
                                    elementId: 'contentView', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'Content View',
                                        path: 'contentView',
                                        dataBindValue: 'contentView',
                                        class: 'span6',
                                        elementConfig: {
                                            data: self._getViewOptionsList(self.model.getContentViews4DataSource(dataConfigViewId)),
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            }
        },

        _getViewOptionsList: function (views) {
            var self = this
            return _.map(views, function (id) {
                return {
                    id: id,
                    text: self.model.viewLabels[id],
                }
            })
        },

        remove: function () {
            var self = this
            self.model.destroy()
        },
        /*
         * toggle between content and its config views
         */
        flipCard: function () {
            var self = this
            var showFront = self.$(self.selectors.back).is(':visible')
            if (showFront && !self.model.isValid()) return
            self.$(self.selectors.front).toggle()
            self.$(self.selectors.back).toggle()
        },

        editTitle: function () {
            var self = this
            self.$(self.selectors.title).hide()
            var titleInput = self.$(self.selectors.titleInput)
            titleInput.show()
            titleInput.focus()
        },

        saveTitle: function () {
            var self = this
            self.$(self.selectors.title).show()
            self.$(self.selectors.titleInput).hide()
        },

        resize: function () {
            var self = this
            var viewId = self.model.getViewConfig('contentView').elementId
            var widgetContentView = self.childViewMap[viewId]
            if (!widgetContentView || !_.isFunction(widgetContentView.resize)) return
            widgetContentView.resize()
        },

        subscribeConfigChange: function (id) {
            var self = this
            // update widget content on it's config change
            var configView = self.childViewMap[id]
            // TODO BUG: https://app.asana.com/0/110546790583988/150392415498511
            configView.off('change')
            configView.on('change', self.onConfigChange.bind(self))
        },

        onConfigChange: function () {
            var self = this
            if (self.model.isValid()) {
                self.renderContentView()
                self.flipCard()
                self.model.save()
            }
        },

        changeConfigTab: function (e) {
            var self = this
            self.$(self.selectors.configTabs).hide()
            var id = self.$(e.target).data('id')
            self.$('#' + id).show()
        },
    })
    return WidgetView;
})
