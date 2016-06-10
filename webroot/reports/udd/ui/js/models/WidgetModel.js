/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var StatQueryFormModel = require('reports/udd/ui/js/models/StatQueryFormModel')
    var ContrailModel = require('contrail-model')
    var defaultConfig = JSON.parse(require('text!reports/udd/data/default.config.json'))

    var WidgetModel = Backbone.Model.extend({
        constructor: function (p) {
            var self = this
            p = p || {}
            p.contentConfig = p.contentConfig || {}
            p.contentConfig.contentView = p.contentConfig.contentView || _.extend({}, defaultConfig.contentViewList['LineChartView'].contentView)
            p.contentConfig.contentConfigView = p.contentConfig.contentConfigView || _.extend({}, defaultConfig.contentViewList['LineChartView'].contentConfigView)
            p.contentConfig.dataConfigView = p.contentConfig.dataConfigView || _.extend({}, defaultConfig.dataSourceList['QueryConfigView'])
                
            p.id = p.id || 'w' + qewu.generateQueryUUID()
            p.config = p.config || {}
            p.config.title = p.config.title || p.id

            var views = {
                contentView: p.contentConfig.contentView.view,
                dataConfigView: p.contentConfig.dataConfigView.view,
            }
            p.viewsModel = new ContrailModel(views)

            // TODO this model should be configurable
            p.dataConfigModel = new StatQueryFormModel(p.contentConfig.dataConfigView.viewConfig)
            p.contentConfigModel = new ContrailModel(p.contentConfig.contentView.viewConfig)
            Backbone.Model.apply(self, arguments);

            // update yAxisValue based on contentConfigModel select field
            p.dataConfigModel.model().on('change', function () {
                var select = p.dataConfigModel.select()
                var yAxisValues = _.without(select.split(', '), 'T=', 'T')
                p.contentConfigModel.model().set('yAxisValues', yAxisValues)
            })
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
            var contentConfigModel = attrs.contentConfigModel.model().toJSON()
            var dataConfigModel = attrs.dataConfigModel.model().toJSON()

            return {
                config: attrs.config,
                contentConfig: {
                    contentView: {
                        view: attrs.contentConfig.contentView.view,
                        viewPathPrefix: attrs.contentConfig.contentView.viewPathPrefix,
                        viewConfig: {
                            color: contentConfigModel.color,
                            yAxisLabel: contentConfigModel.yAxisLabel,
                            yAxisValue: contentConfigModel.yAxisValue,
                        },
                    },
                    contentConfigView: defaultConfig.contentViewList[attrs.contentConfig.contentView.view],
                    dataConfigView: {
                        view: attrs.contentConfig.dataConfigView.view,
                        viewPathPrefix: attrs.contentConfig.dataConfigView.viewPathPrefix,
                        viewConfig: {
                            table_name: dataConfigModel.table_name,
                            select: dataConfigModel.select,
                            time_range: dataConfigModel.time_range,
                        }
                    }
                }
            }
        }
    })
    return WidgetModel
})
