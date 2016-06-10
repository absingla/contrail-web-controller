/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var StatQueryFormModel = require('reports/udd/ui/js/models/StatQueryFormModel')
    var ContrailModel = require('contrail-model')

    var WidgetModel = Backbone.Model.extend({
        constructor: function (p) {
            var self = this
            //if (!p || !p.dataConfig || !p.contentConfig) {
                //p.dataConfig = _.extend({}, self.dataSources.query)
                //p.contentConfig = _.extend({}, self.chartViews.line)
            //}
            //self.id = self.id || qewu.generateQueryUUID()

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
