/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var Backbone = require('backbone')
    var qewu = require('core-basedir/js/common/qe.utils')
    var cowc = require('core-constants')
    var ContrailModel = require('contrail-model')
    var defaultConfig = JSON.parse(require('text!reports/udd/data/default.config.json'))

    var WidgetModel = Backbone.Model.extend({
        initialize: function (_p) {
            var self = this
            self.ready = false
            var attrs = self.attributes
            if (!_p || !_p.id) {
                var p = _p || {}
                self.id = qewu.generateQueryUUID().slice(0, 36)
                attrs.config = p.config || {}
                attrs.id = self.id
                attrs.config.title = self.id
                attrs.contentConfig = self.getDefaultConfig()
            }

            var views = {
                dataConfigView: attrs.contentConfig.dataConfigView.view,
                contentView: attrs.contentConfig.contentView.view,
            }
            attrs.viewsModel = new ContrailModel(views)
            attrs.viewsModel.model().on('change', self.changeConfigModel.bind(self))

            attrs.configModel = new ContrailModel(attrs.config)
            // autosave widget gui config
            attrs.configModel.model().on('change', function () {
                self.save()
            })
            require([attrs.contentConfig.dataConfigView.model, attrs.contentConfig.contentConfigView.model], self._onConfigModelsLoaded.bind(self))
            self._parseViewLabels()
        },

        parse: function (data) {
            // on successful model save
            if (data.result) return data
            if (data.error) {
                console.error(data)
                return []
            }

            data.contentConfig.contentConfigView.modelConfig = JSON.parse(data.contentConfig.contentConfigView.modelConfig)
            data.contentConfig.dataConfigView.modelConfig = JSON.parse(data.contentConfig.dataConfigView.modelConfig)
            return data
        },
        /*
         * TODO
         */
        validate: function () {
            var self = this
            var validConfig = !!self.attributes.configModel.title()
            var validContentConfig = self.attributes.contentConfigModel.model().isValid(true, 'validation')
            var validDataConfig = self.attributes.dataConfigModel.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)
            return !(validConfig && validContentConfig && validDataConfig)
        },

        getDataSourceList: function () {
            return _.keys(defaultConfig.dataSources)
        },

        getContentViews4DataSource: function (dataSourceName) {
            return defaultConfig.dataSources[dataSourceName].contentViews
        },

        getDefaultConfig: function () {
            var self = this
            var config = {}
            var defaultDataSource = self.getDataSourceList()[0]
            var defaultDataSourceView = defaultConfig.dataSources[defaultDataSource]
            var defaultContent = self.getContentViews4DataSource(defaultDataSource)[0]
            var defaultContentView = defaultConfig.contentViews[defaultContent]
            config.dataConfigView = _.extend({}, defaultDataSourceView)
            config.contentView = _.extend({}, defaultContentView.contentView)
            config.contentConfigView = _.extend({}, defaultContentView.contentConfigView)
            return config
        },

        getViewConfig: function (viewType) {
            var self = this
            var viewsModel = self.get('viewsModel').model()
            var viewId
            var viewPathPrefix
            var viewConfig = {}
            switch (viewType) {
            case 'dataConfigView':
                viewId = viewsModel.get(viewType)
                viewPathPrefix = defaultConfig.dataSources[viewId].viewPathPrefix
                break
            case 'contentView':
                viewId = viewsModel.get(viewType)
                viewPathPrefix = defaultConfig.contentViews[viewId][viewType].viewPathPrefix
                viewConfig = self.get('contentConfigModel').getContentViewOptions()
                break
            case 'contentConfigView':
                var contentView = viewsModel.get('contentView')
                viewId = defaultConfig.contentViews[contentView][viewType].view
                viewPathPrefix = defaultConfig.contentViews[contentView][viewType].viewPathPrefix
                break
            default:
            }
            return {
                view: viewId,
                viewPathPrefix: viewPathPrefix,
                elementId: self.get('id') + '-' + viewType,
                viewConfig: viewConfig,
            }
        },

        getConfigModelId: function (contentView) {
            if (!contentView) return ''
            var config = defaultConfig.contentViews[contentView]
            if (config) return config.contentConfigView.model
            return defaultConfig.dataSources[contentView].model
        },

        changeConfigModel: function (viewsModel) {
            var self = this
            if (!viewsModel.changed.contentView) return
            var contentConfigModel = self.getConfigModelId(viewsModel.changed.contentView)
            require([null, contentConfigModel], self._onConfigModelsLoaded.bind(self))
        },

        toJSON: function () {
            var self = this
            var attrs = self.attributes
            var configModel = attrs.configModel

            var result = {
                '"dashboardId"': attrs.dashboardId,
                '"tabId"': attrs.tabId,
                config: {
                    title: configModel.title(),
                    x: configModel.x(),
                    y: configModel.y(),
                    width: configModel.width(),
                    height: configModel.height(),
                },
                '"contentConfig"': {
                    dataConfigView: {
                        view: self.getViewConfig('dataConfigView').view,
                        '"viewPathPrefix"': self.getViewConfig('dataConfigView').viewPathPrefix,
                        '"model"': self.getConfigModelId(attrs.viewsModel.dataConfigView()),
                        '"modelConfig"': JSON.stringify(attrs.dataConfigModel.toJSON()),
                    },
                    contentView: {
                        view: self.getViewConfig('contentView').view,
                        '"viewPathPrefix"': self.getViewConfig('contentView').viewPathPrefix,
                    },
                    contentConfigView: {
                        view: self.getViewConfig('contentConfigView').view,
                        '"viewPathPrefix"': self.getViewConfig('contentConfigView').viewPathPrefix,
                        '"model"': self.getConfigModelId(attrs.viewsModel.contentView()),
                        '"modelConfig"': JSON.stringify(attrs.contentConfigModel.toJSON()),
                    },
                },
            }
            return result
        },

        _onConfigModelsLoaded: function (DataConfigModel, ContentConfigModel) {
            var self = this
            var attrs = self.attributes
            if (DataConfigModel) self.set('dataConfigModel', new DataConfigModel(attrs.contentConfig.dataConfigView.modelConfig))
            if (ContentConfigModel) self.set('contentConfigModel', new ContentConfigModel(attrs.contentConfig.contentConfigView.modelConfig))

            // TODO move to specific widget
            // update yAxisValue based on contentConfigModel select field
            self._updateContentConfigModel()
            attrs.dataConfigModel.model().on('change', self._updateContentConfigModel.bind(self))

            self.ready = true
            // TODO do not trigger layoutView.renderWidgetView
            self.trigger('ready')
        },

        _updateContentConfigModel: function () {
            var self = this
            var attrs = self.attributes
            var select = attrs.dataConfigModel.select()
            if (_.isEmpty(select)) return
            var yAxisValues = _.without(select.split(', '), 'T=', 'T')
            attrs.contentConfigModel.model().set('yAxisValues', yAxisValues)
        },

        _parseViewLabels: function () {
            var self = this
            self.viewLabels = {}
            _.each(_.extend({}, defaultConfig.contentViews, defaultConfig.dataSources), function (config, id) {
                self.viewLabels[id] = config.label
            })
        },
    })
    return WidgetModel
})
