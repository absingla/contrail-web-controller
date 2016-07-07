/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailModel = require('contrail-model')
    var defaultConfig = JSON.parse(require('text!reports/udd/data/default.config.json'))
    var qewu = require('core-basedir/js/common/qe.utils')

    var WidgetModel = Backbone.Model.extend({
        initialize: function (p) {
            var self = this
            self.ready = false
            var attrs = self.attributes
            if (!p || !p.id) {
                p = p || {}
                self.id = qewu.generateQueryUUID().slice(0, 36)
                attrs.config = p.config || {}
                attrs.id = self.id
                attrs.config.title = self.id
                attrs.contentConfig = self.getDefaultConfig()
            }

            var views = {
                contentView: attrs.contentConfig.contentView.view,
                dataConfigView: attrs.contentConfig.dataConfigView.view,
            }
            attrs.viewsModel = new ContrailModel(views)

            attrs.configModel = new ContrailModel(attrs.config)
            // autosave widget gui config
            attrs.configModel.model().on('change', function () {
                self.save()
            })
            require([attrs.contentConfig.dataConfigView.model, attrs.contentConfig.contentConfigView.model], self.onConfigModelsLoaded.bind(self))
        },

        parse: function (data) {
            // on successful model save
            if (data.result) return
            if (data.error) {
                console.log(data)
                return
            }

            data.contentConfig.contentView.modelConfig = JSON.parse(data.contentConfig.contentView.modelConfig)
            data.contentConfig.dataConfigView.modelConfig = JSON.parse(data.contentConfig.dataConfigView.modelConfig)
            return data
        },
        /*
         * TODO
         */
        validate: function () {
            var self = this
            var validConfig = !!self.attributes.configModel.title()
            return !(validConfig && self.attributes.dataConfigModel.model().isValid() && self.attributes.contentConfigModel.model().isValid())
        },

        getDataSourceList: function () {
            return _.keys(defaultConfig.dataSourceList)
        },

        getContentViews4DataSource: function (dataSourceName) {
            return defaultConfig.dataSourceList[dataSourceName].contentViews
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
                    contentView: {
                        view: attrs.contentConfig.contentView.view,
                        '"viewPathPrefix"': attrs.contentConfig.contentView.viewPathPrefix,
                        '"model"': attrs.viewsModel.contentView(),
                        '"modelConfig"': JSON.stringify(attrs.contentConfigModel.toJSON()),
                    },
                    contentConfigView: {
                        view: attrs.contentConfig.contentConfigView.view,
                        '"viewPathPrefix"': attrs.contentConfig.contentConfigView.viewPathPrefix,
                    },
                    dataConfigView: {
                        view: attrs.contentConfig.dataConfigView.view,
                        '"viewPathPrefix"': attrs.contentConfig.dataConfigView.viewPathPrefix,
                        '"model"': attrs.viewsModel.dataConfigView(),
                        '"modelConfig"': JSON.stringify(attrs.dataConfigModel.toJSON()),
                    }
                }
            }
            return result
        },

        getDefaultConfig: function () {
            var self = this
            var config = {}
            var defaultDataSource = self.getDataSourceList()[0]
            var defaultDataSourceView = defaultConfig.dataSourceList[defaultDataSource]
            var defaultContent = self.getContentViews4DataSource(defaultDataSource)[0]
            var defaultContentView = defaultConfig.contentViewList[defaultContent]
            config.dataConfigView = _.extend({}, defaultDataSourceView)
            config.contentView = _.extend({}, defaultContentView.contentView)
            config.contentConfigView = _.extend({}, defaultContentView.contentConfigView)
            return config
        },

        onConfigModelsLoaded: function (DataConfigModel, ContentConfigModel) {
            var self = this
            var attrs = self.attributes
            attrs.dataConfigModel = new DataConfigModel(attrs.contentConfig.dataConfigView.modelConfig)
            attrs.contentConfigModel = new ContentConfigModel(attrs.contentConfig.contentView.modelConfig)

            // TODO move to specific widget
            // update yAxisValue based on contentConfigModel select field
            attrs.dataConfigModel.model().on('change', function () {
                var select = attrs.dataConfigModel.select()
                if (_.isEmpty(select)) return
                var yAxisValues = _.without(select.split(', '), 'T=', 'T')
                attrs.contentConfigModel.model().set('yAxisValues', yAxisValues)
            })
            self.ready = true
            self.trigger('ready')
        }
    })
    return WidgetModel
})
