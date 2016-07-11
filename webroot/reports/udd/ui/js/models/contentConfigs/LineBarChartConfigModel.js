/*
* Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
*/

define(function (require) {
    var ContrailModel = require('contrail-model')

    return ContrailModel.extend({
        defaultConfig: {
            "barColor": "1f77b4",
            "lineColor": "green",
            "barLabel": "",
            "barValue": "",
            "lineLabel": "",
            "lineValue": "",
            "yAxisValues": [],
        },

        validations: {
            validation: {
                'barValue': {
                    required: true,
                    msg: 'Bar Value is required',
                },
                'lineValue': {
                    required: true,
                    msg: 'Line Value is required',
                }
            }
        },

        toJSON: function () {
            var self = this
            return {
                "barColor": self.barColor(),
                "lineColor": self.lineColor(),
                "barLabel": self.barLabel(),
                "barValue": self.barValue(),
                "lineLabel": self.lineLabel(),
                "lineValue": self.lineValue(),
            }
        },

        getParserOptions: function () {
            var self = this
            return {
                parserName: 'timeSeriesParser',
                dataFields: [self.barValue(), self.lineValue()],
            }
        },

        getContentViewOptions: function () {
            var self = this
            return {
                chartOptions: {
                    axisLabelDistance: 5,
                    height: 300,
                    yAxisLabels: [self.barLabel(), self.lineLabel()],
                    colors: [self.barColor(), self.lineColor()],
                    forceY: [0, 10],
                    y1Formatter: function (d) {
                        return d
                    },
                    y2Formatter: function (d) {
                        return d
                    },
                }
            }
        }
    })
})
