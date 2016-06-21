/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var StatQueryFormModel = require('reports/udd/ui/js/models/StatQueryFormModel')
    var ContrailModel = require('contrail-model')
    var defaultConfig = JSON.parse(require('text!reports/udd/data/default.config.json'))
    var qewu = require('core-basedir/js/common/qe.utils')

    var WidgetModel = Backbone.Model.extend({
        initialize: function (p) {
            var self = this
            var attrs = self.attributes
            if (!p || !p.id) {
                p = p || {}
                self.id = qewu.generateQueryUUID().slice(0, 36)
                attrs.config = p.config || {}
                attrs.id = self.id
                attrs.config.title = self.id
                    
                attrs.contentConfig = {}
                attrs.contentConfig.contentView = _.extend({}, defaultConfig.contentViewList['LineChartView'].contentView)
                attrs.contentConfig.contentConfigView = _.extend({}, defaultConfig.contentViewList['LineChartView'].contentConfigView)
                attrs.contentConfig.dataConfigView = _.extend({}, defaultConfig.dataSourceList['QueryConfigView'])
            }

            var views = {
                contentView: attrs.contentConfig.contentView.view,
                dataConfigView: attrs.contentConfig.dataConfigView.view,
            }
            attrs.viewsModel = new ContrailModel(views)

            // TODO this model should be configurable
            attrs.dataConfigModel = new StatQueryFormModel(attrs.contentConfig.dataConfigView.viewConfig)
            attrs.contentConfigModel = new ContrailModel(attrs.contentConfig.contentView.viewConfig)

            // update yAxisValue based on contentConfigModel select field
            attrs.dataConfigModel.model().on('change', function () {
                var select = attrs.dataConfigModel.select()
                if (_.isEmpty(select)) return
                var yAxisValues = _.without(select.split(', '), 'T=', 'T')
                attrs.contentConfigModel.model().set('yAxisValues', yAxisValues)
            })
        },

        parse: function (data) {
            // on successful model save
            if (data.result) {
                if (data.error) console.log(data)
                return
            }

            data.contentConfig.contentView.viewConfig = JSON.parse(data.contentConfig.contentView.viewConfig)
            data.contentConfig.dataConfigView.viewConfig = JSON.parse(data.contentConfig.dataConfigView.viewConfig)
            return data
        },
        /*
         * TODO
         */
        validate: function () {
            var self = this
            var config = self.attributes.config
            var validConfig = !!config.title
            return !validConfig || !self.attributes.dataConfigModel.select() || !self.attributes.contentConfigModel.model().get('yAxisValue')
            //return !(validConfig && self.attributes.dataConfigModel.model().isValid() && self.attributes.contentConfigModel.model().isValid())
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

            var result = {
                config: {
                    title: attrs.config.title,
                    x: attrs.config.x,
                    y: attrs.config.y,
                    width: attrs.config.width,
                    height: attrs.config.height,
                },
                "\"contentConfig\"": {
                    contentView: {
                        view: attrs.contentConfig.contentView.view,
                        "\"viewPathPrefix\"": attrs.contentConfig.contentView.viewPathPrefix,
                        "\"viewConfig\"": JSON.stringify({
                            color: contentConfigModel.color,
                            yAxisLabel: contentConfigModel.yAxisLabel,
                            yAxisValue: contentConfigModel.yAxisValue,
                        }),
                    },
                    contentConfigView: {
                        view: attrs.contentConfig.contentConfigView.view,
                        "\"viewPathPrefix\"": attrs.contentConfig.contentConfigView.viewPathPrefix,
                    },
                    dataConfigView: {
                        view: attrs.contentConfig.dataConfigView.view,
                        "\"viewPathPrefix\"": attrs.contentConfig.dataConfigView.viewPathPrefix,
                        "\"viewConfig\"": JSON.stringify({
                            table_name: dataConfigModel.table_name,
                            select: dataConfigModel.select,
                            time_range: dataConfigModel.time_range,
                        })
                    }
                }
            }
            return result
        }
    })
    return WidgetModel
})
