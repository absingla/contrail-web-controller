/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/**
 * widget container
 */
define(function (require) {
    var cowc = require('core-constants')
    var ContrailView = require('contrail-view')
    var Knockback = require('knockback')

    var WidgetView = ContrailView.extend({
        selectors: {
            heading: '.panel-heading',
            configTitle: '.config-title',
            title: '.panel-heading>.title',
            titleInput: '.panel-heading>input',
            steps: '.panel-body>.step',
            footer: '.panel-footer',
            configSelectors: '.panel-body>.config-selectors',
            dataConfigDropdown: '#dataConfigViewSelector',
            contentConfigDropdown: '#contentViewSelector',
            back: '.panel-footer .back',
        },

        events: {
            'click .close': 'remove',
            'click .panel-heading .config': 'toggleConfig',
            'click .title': 'editTitle',
            'keydown .edit-title': '_onKeyInTitle',
            'blur .panel-heading>input': 'saveTitle',
            'click .panel-footer .submit': 'submit',
            'click .panel-footer .reset': 'reset',
            'click .panel-footer .back': 'backStep',
        },

        steps: {
            DATA_CONFIG: '.data-config',
            CONTENT_CONFIG: '.content-config',
            CONTENT: '.content-view',
        },

        initialize: function () {
            var self = this
            // rerender on contentView change
            self.listenTo(self.model, 'change:dataConfigModel', self._renderDataConfigView.bind(self))
            self.listenTo(self.model, 'change:contentConfigModel', self._renderContentConfigView.bind(self))
        },

        render: function () {
            var self = this

            Knockback.applyBindings(self.model.get('configModel'), self.$el.find(self.selectors.heading)[0])
            // show config by default for widget with no data source selected
            if (self.model.isValid()) {
                self.goStep(self.steps.CONTENT)
            } else self.goStep(self.steps.DATA_CONFIG)

            self._renderDataConfigView()
            self._renderContentConfigView()
            self._renderConfigSelectors()
            self._renderFooter()
            return self
        },
        // render data source config (query) on the back
        _renderDataConfigView: function () {
            var self = this
            var config = self.model.getViewConfig('dataConfigView')
            var element = self.$('#' + config.elementId)
            var model = self.model.get('dataConfigModel')
            var oldView = self.childViewMap[config.elementId]
            if (oldView) oldView.remove()
            self.renderView4Config(element, model, config)
        },
        // render widget content (chart) on the front
        _renderContentView: function () {
            var self = this
            var parserOptions = self.model.get('contentConfigModel') ? self.model.get('contentConfigModel').getParserOptions() : {}
            var dataConfigModel = self.model.get('dataConfigModel')
            var model = dataConfigModel.getDataModel(parserOptions)
            var config = self.model.getViewConfig('contentView')
            var element = self.$('#' + config.elementId)
            if (!model) element.html('No compatible data sources selected')
            self.renderView4Config(element, model, config)
        },
        // render content config view on the back
        _renderContentConfigView: function () {
            var self = this
            var config = self.model.getViewConfig('contentConfigView')
            var oldView = self.childViewMap[config.elementId]
            if (oldView) oldView.remove()
            if (!config.view) {
                if (self.model.isValid()) self._renderContentView()
                return
            }
            var element = self.$('#' + config.elementId)
            var model = self.model.get('contentConfigModel')
            self.renderView4Config(element, model, config, null, null, null, function () {
                // render Content View only after Content Config view
                // in order for content config model to be already loaded
                if (self.model.isValid()) self._renderContentView()
            })
        },

        _renderConfigSelectors: function () {
            var self = this
            var config = self.getViewConfig()
            var element = self.$(self.selectors.configSelectors)
            var model = self.model.get('viewsModel')
            self.renderView4Config(element, model, config, null, null, null, function () {
                Knockback.applyBindings(model, element[0])
            })
        },

        _renderFooter: function () {
            var self = this
            var config = self.getFooterConfig()
            var element = self.$(self.selectors.footer)
            self.renderView4Config(element, null, config)
        },

        getViewConfig: function () {
            var self = this
            return {
                view: 'SectionView',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'dataConfigViewSelector', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'Data Source',
                                        path: 'dataConfigView',
                                        dataBindValue: 'dataConfigView',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: 'text', dataValueField: 'id',
                                            data: self._getViewOptionsList(self.model.getDataSourceList()),
                                        },
                                    },
                                }, {
                                    elementId: 'contentViewSelector', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'Content View',
                                        path: 'contentView',
                                        dataBindValue: 'contentView',
                                        class: 'col-xs-6 hidden',
                                        elementConfig: {
                                            data: self._getViewOptionsList(self.model.getContentViewList()),
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            }
        },

        getFooterConfig: function () {
            return {
                view: 'SectionView',
                class: 'panel-footer',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'back', view: 'FormButtonView',
                                    viewConfig: {
                                        label: 'Back',
                                        class: 'back display-inline-block',
                                    },
                                }, {
                                    elementId: 'submit', view: 'FormButtonView',
                                    viewConfig: {
                                        label: 'Next',
                                        class: 'submit display-inline-block',
                                        elementConfig: {
                                            btnClass: 'btn-primary',
                                        },
                                    },
                                }, {
                                    elementId: 'reset-query', view: 'FormButtonView',
                                    label: 'Reset',
                                    viewConfig: {
                                        label: 'Reset',
                                        class: 'reset display-inline-block',
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

        _onKeyInTitle: function (e) {
            var self = this
            if (e.keyCode === 13) self.saveTitle()
        },

        remove: function () {
            var self = this
            self.model.destroy()
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

        goStep: function (step) {
            var self = this
            if (self.currentStep === step) return
            self.$(self.selectors.steps).hide()
            self.$(step).show()
            if (self.currentStep === self.steps.CONTENT || step === self.steps.CONTENT) {
                self.$(self.selectors.configSelectors).toggle()
                self.$(self.selectors.footer).toggle()
            }

            var configTitle = ''
            if (step === self.steps.DATA_CONFIG) {
                configTitle = 'Data Config: '
                self.$(self.selectors.back).hide()
                self.$(self.selectors.contentConfigDropdown).hideElement()
                self.$(self.selectors.dataConfigDropdown).showElement()
                self.$('.submit button').html('Next')
            }
            if (step === self.steps.CONTENT_CONFIG) {
                configTitle = 'Content View Config: '
                self.$(self.selectors.back).show()
                self.$(self.selectors.dataConfigDropdown).hideElement()
                self.$(self.selectors.contentConfigDropdown).showElement()
                self.$('.submit button').html('Submit')
            }
            self.$(self.selectors.configTitle).html(configTitle)

            self.currentStep = step
        },
        /* trigger current step model validation
         * go to next wizard step
         * if last step - save model and update content view
         */
        submit: function () {
            var self = this
            if (self.currentStep === self.steps.DATA_CONFIG) {
                if (!self.model.get('dataConfigModel').model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)) return
                self.goStep(self.steps.CONTENT_CONFIG)
            } else if (self.currentStep === self.steps.CONTENT_CONFIG) {
                if (!self.model.isValid()) return
                self._renderContentView()
                self.model.save()
                self.goStep(self.steps.CONTENT)
            }
        },

        toggleConfig: function () {
            var self = this
            if (!self.model.isValid()) return
            if (self.currentStep === self.steps.DATA_CONFIG || self.currentStep === self.steps.CONTENT_CONFIG) {
                self._renderContentView()
                self.goStep(self.steps.CONTENT)
            } else self.goStep(self.steps.DATA_CONFIG)
        },

        backStep: function () {
            var self = this
            self.goStep(self.steps.DATA_CONFIG)
        },

        reset: function () {
            var self = this
            if (self.currentStep === self.steps.DATA_CONFIG) {
                self.model.get('dataConfigModel').reset()
            }
            var contentConfigModel = self.model.get('contentConfigModel')
            if (contentConfigModel) contentConfigModel.reset()
        },
    })
    return WidgetView
})
