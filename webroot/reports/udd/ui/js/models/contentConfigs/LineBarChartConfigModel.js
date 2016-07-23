/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailModel = require('contrail-model')
    var cowc = require('core-constants')
    var cowf = new (require('core-formatters'))

    return ContrailModel.extend({
        defaultConfig: {
            barColor: '1f77b4',
            lineColor: 'green',
            barLabel: '',
            barValue: '',
            lineLabel: '',
            lineValue: '',
            yAxisValues: [],
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
                },
            },
        },

        setDataModel: function (dataModel) {
            var self = this
            self.dataModel = dataModel
            // TODO there should be off call in destroy method
            self.dataModel.model().on('change:timeSeries', self.onDataModelChange.bind(self))
            self.onDataModelChange(undefined, self.dataModel.timeSeries())
        },
        // update fields dependent on data model
        onDataModelChange: function (model, timeSeries) {
            var self = this
            self.model().set('yAxisValues', timeSeries)
        },

        toJSON: function () {
            var self = this
            return {
                barColor: self.barColor(),
                lineColor: self.lineColor(),
                barLabel: self.barLabel(),
                barValue: self.barValue(),
                lineLabel: self.lineLabel(),
                lineValue: self.lineValue(),
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
                    y1Formatter: cowf.getFormattedValue.bind(cowf, cowc.QUERY_COLUMN_FORMATTER[self.barValue()]),
                    y2Formatter: cowf.getFormattedValue.bind(cowf, cowc.QUERY_COLUMN_FORMATTER[self.lineValue()]),
                },
            }
        },
    })
})
