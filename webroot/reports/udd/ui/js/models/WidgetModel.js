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
            p.contentConfig.dataConfigView = p.contentConfig.dataConfigView || _.extend({}, defaultConfig.dataViewList['QueryConfigView'])
                
            p.id = p.id || 'w' + qewu.generateQueryUUID()
            p.title = p.id

            p.dataConfigModel = new StatQueryFormModel(p.contentConfig.dataConfigView.viewConfig)
            p.contentConfigModel = new ContrailModel(p.contentConfig.contentView.viewConfig)
            Backbone.Model.apply(self, arguments);

            // update yAxisValue based on contentConfigModel select field
            p.dataConfigModel.model().on('change', function () {
                var select = p.dataConfigModel.select()
                var yAxisValues = _.without(select.split(', '), 'T=', 'T')
                p.contentConfigModel.model().set('yAxisValues', yAxisValues)
            })
        }
    })
    return WidgetModel
})
