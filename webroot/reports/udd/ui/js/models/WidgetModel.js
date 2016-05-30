/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var StatQueryFormModel = require('reports/udd/ui/js/models/StatQueryFormModel')

    var WidgetModel = Backbone.Model.extend({
        chartViews: {
            line: {
                view: "WidgetLineChartView",
                configView: "WidgetChartConfigView",
                viewPathPrefix: "reports/udd/ui/js/views/",
            }
        },
        dataSources: {
            query: {
                view: "WidgetQueryConfigView",
                viewPathPrefix: "reports/udd/ui/js/views/",
            }
        },
        constructor: function (p) {
            var self = this
            p.dataModel = new StatQueryFormModel(p.dataConfig.viewConfig)
            p.chartModel = new Backbone.Model(p.widgetContentConfig.viewConfig)
            Backbone.Model.apply(self, arguments);
        }
    })
    return WidgetModel
})
